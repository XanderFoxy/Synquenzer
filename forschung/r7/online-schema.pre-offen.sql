-- =====================================================================================
-- SYNQUENZER · Paket VO „Online-Zusammenarbeit“ · Migration vo_init (Teil A + B)
-- Ziel: eigenes, kostenloses Supabase-Projekt „synquenzer“ (NIE das Klassenzimmer-Projekt).
-- Stand 17.10.2026 (nach Review r7: Geräte-Kennung, Quote, Verwalter, Bibliothek mit Sperre,
-- Versions-Grenzen, Herkunfts-Raum, Publikation ohne DELETE). Lokal geprüft mit PGlite 0.5.8
-- (= Postgres 18.3) + Supabase-Shim (v3-ideen/r7/online-test/rls-matrix.mjs).
-- Nichts davon lief gegen ein echtes Supabase-Projekt.
-- Nur Funktionen aus Postgres 15+ (Supabase-Projekte laufen mit 15 oder 17).
--
-- Grundsätze
--  * Lesen: über RLS-Policies (Rolle authenticated). anon bekommt NICHTS außer public.ping().
--  * Schreiben: nur über geprüfte RPC-Funktionen (SECURITY DEFINER, search_path = ''),
--    Ausnahmen per RLS: eigenes Profil (Name, findbar), eigene Sound-Bibliothek, Sounds im Raum (VO3).
--  * RLS-Hilfsfunktionen liegen im NICHT freigegebenen Schema private (keine Rekursion,
--    weil sie als Eigentümer laufen und space_members/projects ohne RLS lesen).
--  * Projektinhalt als json (nicht jsonb): Text bleibt bytegenau -> Prüfsumme „sum“ der
--    Projektdatei und deep-equal-Tests bleiben gültig (jsonb sortiert Schlüssel um).
-- =====================================================================================

-- ---------- 0. Vorgaben: keine automatischen Rechte für neue Objekte in public ----------
alter default privileges for role postgres in schema public revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from public;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, supabase_auth_admin;   -- Policies rufen private.* als Aufrufer auf

-- ---------- 1. Hilfsfunktionen ohne Tabellenbezug ----------
create or replace function private.new_friend_code()
returns text language plpgsql volatile set search_path = '' as $$
declare a constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text := ''; i int;
begin
  for i in 1..6 loop c := c || substr(a, 1 + floor(random() * 32)::int, 1); end loop;
  return c;
end $$;

create or replace function private.pair_key(a uuid, b uuid)
returns text language sql immutable set search_path = '' as $$
  select least(a, b)::text || ':' || greatest(a, b)::text
$$;

-- ---------- 2. Tabellen ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 24),
  friend_code  text not null unique default private.new_friend_code(),
  findable     boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.spaces (                       -- ein Raum je angenommenem Paar
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'pair' check (kind = 'pair'),
  pair_key   text not null unique,                 -- '<kleinere uuid>:<größere uuid>'
  status     text not null default 'active' check (status in ('active', 'ended')),
  created_at timestamptz not null default now(),
  ended_at   timestamptz,
  ended_by   uuid references auth.users(id) on delete set null
);

create table public.space_members (
  space_id  uuid not null references public.spaces(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id)
);
create index space_members_user_idx on public.space_members (user_id);

create table public.collab_requests (
  id           uuid primary key default gen_random_uuid(),
  from_user    uuid not null references auth.users(id) on delete cascade,
  to_user      uuid not null references auth.users(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'cancelled')),
  note         text check (char_length(note) <= 140),
  created_at   timestamptz not null default now(),
  responded_at timestamptz,
  check (from_user <> to_user)
);
create unique index collab_requests_one_pending on public.collab_requests (least(from_user, to_user), greatest(from_user, to_user)) where status = 'pending';
create index collab_requests_to_idx   on public.collab_requests (to_user, status);
create index collab_requests_from_idx on public.collab_requests (from_user, status);

create table public.projects (                     -- Kopf (klein, in der Realtime-Publikation)
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete restrict,   -- Konto löschen erst nach Übergabe
  space_id   uuid references public.spaces(id) on delete restrict,         -- null = „Nur ich“
  origin_space_id uuid references public.spaces(id) on delete restrict,    -- Kopie aus einem Raum: darf nur dorthin geteilt werden (VO-E7)
  local_id   text check (char_length(local_id) <= 64),                     -- S.id des Erstellers (nur Info)
  title      text not null default 'Projekt' check (char_length(title) between 1 and 60),
  version    integer not null default 1 check (version >= 1),
  format     integer not null default 3 check (format between 1 and 99),
  app_code   integer not null default 0 check (app_code between 0 and 99999999),  -- höchste App-Version: Major*1e6+Minor*1e3+Patch
  size_bytes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,                          -- Papierkorb (weich)
  deleted_by uuid references auth.users(id) on delete set null
);
create index projects_owner_idx on public.projects (owner_id, updated_at desc);
create index projects_space_idx on public.projects (space_id, updated_at desc);

create table public.project_data (                 -- Inhalt (groß, NICHT in der Realtime-Publikation)
  project_id uuid primary key references public.projects(id) on delete cascade,
  version    integer not null,
  body       json not null check (octet_length(body::text) <= 2000000),
  body_md5   text not null
);

create table public.project_versions (             -- Verlauf: nichts geht verloren
  id         bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  version    integer not null,                     -- Server-Stand, auf dem diese Fassung beruht
  kind       text not null check (kind in ('auto', 'handover', 'conflict', 'manual', 'import')),
  label      text check (char_length(label) <= 80),
  body       json not null check (octet_length(body::text) <= 2000000),
  size_bytes integer not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  client_id  text not null default '' check (char_length(client_id) <= 64)   -- Gerät/Speicher (KV cloud:device), nur für Konflikt-Fassungen
);
create index project_versions_proj_idx on public.project_versions (project_id, created_at desc);
create index project_versions_by_idx   on public.project_versions (created_by);
-- je Person, Gerät, Stand und Grund (label) genau eine Konflikt-Fassung mit dem neuesten Inhalt:
-- zwei eigene Geräte oder „Ältere App“ und „Gleichzeitig“ überschreiben sich nicht gegenseitig
create unique index project_versions_one_conflict on public.project_versions (project_id, created_by, client_id, version, label) where kind = 'conflict';

create table public.user_libraries (               -- eigene Sounds (eine Datei je Person)
  owner_id   uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  version    integer not null default 1,
  body       json not null check (octet_length(body::text) <= 2000000),
  size_bytes integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.space_sounds (                 -- VO3 (optional): Sounds in einem Raum teilen
  id         uuid primary key default gen_random_uuid(),
  space_id   uuid not null references public.spaces(id) on delete cascade,
  owner_id   uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name       text not null check (char_length(name) between 1 and 40),
  engine     text not null check (engine in ('analog', 'fm6', 'wt', 'drum', 'mask', 'add', 'body')),
  role       text check (char_length(role) <= 16),
  body       json not null check (octet_length(body::text) <= 65536),
  created_at timestamptz not null default now()
);
create index space_sounds_space_idx on public.space_sounds (space_id, created_at desc);

create table private.signup_allowlist (            -- Einlass-Liste für den Before-User-Created-Hook
  email      text primary key check (email = lower(email) and position('@' in email) > 1),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table private.admins (                      -- Verwalter (Xander); Eintrag per execute_sql im Rollout R4
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table private.settings (                    -- genau eine Zeile; Werte per Migration ändern
  id          boolean primary key default true check (id),
  max_app     integer not null,                    -- höchste ausgelieferte App-Version (vor JEDEM Ausliefern erhöhen, Rollout R7)
  max_format  integer not null,                    -- höchstes Projektformat
  quota_bytes bigint  not null                     -- Mengengrenze je Person (Rohtext-Bytes)
);
insert into private.settings (max_app, max_format, quota_bytes) values (3001000, 3, 60 * 1024 * 1024);

-- ---------- 3. RLS-Hilfen (private, SECURITY DEFINER, search_path leer) ----------
create or replace function private.my_space_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.space_id from public.space_members m where m.user_id = (select auth.uid())
$$;

create or replace function private.my_active_space_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select m.space_id from public.space_members m join public.spaces s on s.id = m.space_id
  where m.user_id = (select auth.uid()) and s.status = 'active'
$$;

create or replace function private.my_project_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select p.id from public.projects p
  where p.owner_id = (select auth.uid())
     or p.space_id in (select m.space_id from public.space_members m where m.user_id = (select auth.uid()))
$$;

create or replace function private.visible_user_ids()       -- ich, meine Raum-Partner, offene Anfragen mit mir
returns setof uuid language sql stable security definer set search_path = '' as $$
  select (select auth.uid())
  union select b.user_id from public.space_members a join public.space_members b on b.space_id = a.space_id
        where a.user_id = (select auth.uid())
  union select case when r.from_user = (select auth.uid()) then r.to_user else r.from_user end
        from public.collab_requests r
        where r.status = 'pending' and (select auth.uid()) in (r.from_user, r.to_user)
$$;

create or replace function private.topic_space_ok(p_topic text)  -- Realtime-Thema 'space:<uuid>' eines aktiven eigenen Raums
returns boolean language plpgsql stable security definer set search_path = '' as $$
begin
  if p_topic is null or p_topic !~ '^space:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  return substr(p_topic, 7)::uuid in (select private.my_active_space_ids());
end $$;

create or replace function private.path_space_ok(p_name text, p_active boolean)  -- Storage-Pfad '<space uuid>/...'
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare f text := split_part(coalesce(p_name, ''), '/', 1);
begin
  if f !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  if p_active then return f::uuid in (select private.my_active_space_ids()); end if;
  return f::uuid in (select private.my_space_ids());
end $$;

create or replace function private.can_write(p_owner uuid, p_space uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((p_space is null and p_owner = (select auth.uid()))
      or (p_space is not null and p_space in (select private.my_active_space_ids())), false)
$$;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.admins a where a.user_id = (select auth.uid()))
$$;

create or replace function private.quota_left(p_uid uuid)   -- freie Bytes der Person (kann negativ sein)
returns bigint language sql stable security definer set search_path = '' as $$
  select (select s.quota_bytes from private.settings s)
       - (select coalesce(sum(p.size_bytes), 0) from public.projects p where p.owner_id = p_uid)
       - (select coalesce(sum(v.size_bytes), 0) from public.project_versions v where v.created_by = p_uid)
       - (select coalesce(sum(l.size_bytes), 0) from public.user_libraries l where l.owner_id = p_uid)
       - (select coalesce(sum(octet_length(x.body::text)), 0) from public.space_sounds x where x.owner_id = p_uid)
$$;

create or replace function private.check_quota(p_uid uuid, p_add bigint)
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if p_add > 0 and private.quota_left(p_uid) < p_add then
    raise exception 'quota' using errcode = '54000';
  end if;
end $$;

-- Konflikt-Fassung aufheben: je (Person, Gerät, Stand, Grund) eine Zeile, immer der neueste Inhalt.
-- Nur eine NEUE Zeile zählt gegen die Quote (Schutz gegen erfundene Geräte-Kennungen).
create or replace function private.keep_conflict(p_project uuid, p_version integer, p_label text, p_client text,
  p_body json, p_size integer, p_uid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.project_versions v where v.project_id = p_project and v.created_by = p_uid
                   and v.client_id = p_client and v.version = p_version and v.label = p_label and v.kind = 'conflict') then
    perform private.check_quota(p_uid, p_size);
  end if;
  insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by, client_id)
    values (p_project, p_version, 'conflict', p_label, p_body, p_size, p_uid, p_client)
    on conflict (project_id, created_by, client_id, version, label) where kind = 'conflict'
    do update set body = excluded.body, size_bytes = excluded.size_bytes, created_at = now();
end $$;

create or replace function private.need_uid()
returns uuid language plpgsql stable set search_path = '' as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not_authenticated' using errcode = '28000'; end if;
  return u;
end $$;

create or replace function private.thin_versions(p_project uuid)   -- 'auto' älter als 30 Tage: nur der letzte Stand je Tag bleibt
returns void language sql security definer set search_path = '' as $$
  delete from public.project_versions v
  where v.project_id = p_project and v.kind = 'auto' and v.created_at < now() - interval '30 days'
    and v.id not in (
      select distinct on (date_trunc('day', x.created_at)) x.id from public.project_versions x
      where x.project_id = p_project and x.kind = 'auto' and x.created_at < now() - interval '30 days'
      order by date_trunc('day', x.created_at), x.created_at desc)
$$;

revoke all on all functions in schema private from public, anon;
revoke all on private.admins, private.settings from public, anon, authenticated;
grant execute on function private.my_space_ids(), private.my_active_space_ids(), private.my_project_ids(),
  private.visible_user_ids(), private.topic_space_ok(text), private.path_space_ok(text, boolean) to authenticated;

-- ---------- 4. Neue Konten: Profil anlegen (Trigger) und Einlass-Liste (Hook) ----------
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare n text := btrim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
begin
  if n = '' then n := split_part(coalesce(new.email, 'Musiker'), '@', 1); end if;
  insert into public.profiles (id, display_name) values (new.id, left(n, 24)) on conflict (id) do nothing;
  -- Einladen = Anfrage (Review r7): wer eingeladen hat, steht als offene Anfrage da; der Neue muss zustimmen (O3)
  insert into public.collab_requests (from_user, to_user)
    select a.invited_by, new.id from private.signup_allowlist a
    where a.email = lower(coalesce(new.email, '')) and a.invited_by is not null and a.invited_by <> new.id
      and exists (select 1 from public.profiles p where p.id = a.invited_by)
    on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.handle_new_user();
revoke all on function private.handle_new_user() from public, anon, authenticated;

-- Before-User-Created-Hook (Dashboard: Authentication → Hooks → Postgres → public.hook_before_user_created)
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb language plpgsql stable set search_path = '' as $$
begin
  if exists (select 1 from private.signup_allowlist a where a.email = lower(coalesce(event -> 'user' ->> 'email', ''))) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object('http_code', 403,
    'message', 'Diese E-Mail ist nicht eingeladen. Bitte frag Xander nach einer Einladung.'));
end $$;
revoke execute on function public.hook_before_user_created(jsonb) from public, anon, authenticated;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
grant select on private.signup_allowlist to supabase_auth_admin;

-- ---------- 5. RLS ----------
alter table public.profiles         enable row level security;
alter table public.spaces           enable row level security;
alter table public.space_members    enable row level security;
alter table public.collab_requests  enable row level security;
alter table public.projects         enable row level security;
alter table public.project_data     enable row level security;
alter table public.project_versions enable row level security;
alter table public.user_libraries   enable row level security;
alter table public.space_sounds     enable row level security;

create policy profiles_read       on public.profiles for select to authenticated using (id in (select private.visible_user_ids()));
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy spaces_read   on public.spaces          for select to authenticated using (id in (select private.my_space_ids()));
create policy members_read  on public.space_members   for select to authenticated using (space_id in (select private.my_space_ids()));
create policy requests_read on public.collab_requests for select to authenticated
  using ((select auth.uid()) in (from_user, to_user));
create policy projects_read on public.projects for select to authenticated
  using (owner_id = (select auth.uid()) or space_id in (select private.my_space_ids()));
create policy pdata_read    on public.project_data     for select to authenticated using (project_id in (select private.my_project_ids()));
create policy pvers_read    on public.project_versions for select to authenticated using (project_id in (select private.my_project_ids()));
create policy lib_own on public.user_libraries for select to authenticated   -- schreiben nur über save_library
  using (owner_id = (select auth.uid()));
create policy ssounds_read   on public.space_sounds for select to authenticated using (space_id in (select private.my_space_ids()));
create policy ssounds_insert on public.space_sounds for insert to authenticated
  with check (owner_id = (select auth.uid()) and space_id in (select private.my_active_space_ids()));
create policy ssounds_delete on public.space_sounds for delete to authenticated using (owner_id = (select auth.uid()));

-- Rechte: alles weg, dann gezielt (wirkt auch, falls das Projekt noch automatische Rechte vergibt)
revoke all on public.profiles, public.spaces, public.space_members, public.collab_requests, public.projects,
  public.project_data, public.project_versions, public.user_libraries, public.space_sounds from anon, authenticated, public;
grant select on public.profiles, public.spaces, public.space_members, public.collab_requests, public.projects,
  public.project_data, public.project_versions to authenticated;
grant update (display_name, findable, updated_at) on public.profiles to authenticated;
grant select on public.user_libraries to authenticated;
grant select, insert, delete on public.space_sounds to authenticated;

-- Listen-Ansichten (security_invoker: es gilt die RLS der Tabellen)
create view public.space_list with (security_invoker = true) as
  select s.id as space_id, s.status, s.created_at, s.ended_at, m.user_id as partner_id, p.display_name as partner_name
  from public.spaces s
  join public.space_members m on m.space_id = s.id and m.user_id <> (select auth.uid())
  left join public.profiles p on p.id = m.user_id;
create view public.project_list with (security_invoker = true) as
  select pr.id, pr.title, pr.space_id, pr.owner_id, po.display_name as owner_name, pr.version, pr.format,
         pr.size_bytes, pr.updated_at, pr.updated_by, pu.display_name as updated_by_name, pr.deleted_at
  from public.projects pr
  left join public.profiles po on po.id = pr.owner_id
  left join public.profiles pu on pu.id = pr.updated_by;
revoke all on public.space_list, public.project_list from anon, public;
grant select on public.space_list, public.project_list to authenticated;

-- ---------- 6. RPC (öffentlich, SECURITY DEFINER mit eigener Prüfung; Advisor-Lint 0029 = gewollt) ----------
create or replace function public.ping() returns text language sql stable set search_path = '' as $$ select 'ok'::text $$;

create or replace function public.set_profile(p_name text, p_findable boolean default null)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); n text := left(btrim(coalesce(p_name, '')), 24);
begin
  if n = '' then raise exception 'name_required' using errcode = '22023'; end if;
  insert into public.profiles (id, display_name) values (uid, n)
    on conflict (id) do update set display_name = excluded.display_name,
      findable = coalesce(p_findable, public.profiles.findable), updated_at = now();
  return (select json_build_object('display_name', p.display_name, 'friend_code', p.friend_code, 'findable', p.findable)
          from public.profiles p where p.id = uid);
end $$;

create or replace function public.find_user(p_query text)       -- höchstens 1 Treffer, nie die E-Mail
returns table (user_id uuid, display_name text, friend_code text)
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); q text := btrim(coalesce(p_query, ''));
begin
  if char_length(q) < 2 or char_length(q) > 120 then return; end if;
  if position('@' in q) > 0 then
    return query select p.id, p.display_name, p.friend_code from public.profiles p join auth.users u on u.id = p.id
      where lower(u.email) = lower(q) and p.id <> uid limit 1;
  elsif upper(ltrim(q, '#')) ~ '^[A-Z0-9]{6}$' and exists (select 1 from public.profiles x where x.friend_code = upper(ltrim(q, '#'))) then
    return query select p.id, p.display_name, p.friend_code from public.profiles p
      where p.friend_code = upper(ltrim(q, '#')) and p.id <> uid limit 1;
  else                                                         -- Name: nur bei genau einem Treffer
    if (select count(*) from public.profiles p where p.findable and lower(p.display_name) = lower(q) and p.id <> uid) > 1 then
      return query select null::uuid, left(q, 24), null::text;   -- „mehrere – bitte Code oder E-Mail“
      return;
    end if;
    return query select p.id, p.display_name, p.friend_code from public.profiles p
      where p.findable and lower(p.display_name) = lower(q) and p.id <> uid limit 1;
  end if;
end $$;

create or replace function public.respond_request(p_request uuid, p_accept boolean)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); r public.collab_requests%rowtype; sid uuid;
begin
  select * into r from public.collab_requests where id = p_request for update;
  if not found or r.to_user <> uid then raise exception 'not_found' using errcode = 'P0002'; end if;
  if r.status <> 'pending' then return json_build_object('status', r.status); end if;
  if not coalesce(p_accept, false) then
    update public.collab_requests set status = 'declined', responded_at = now() where id = r.id;
    return json_build_object('status', 'declined');
  end if;
  insert into public.spaces (pair_key) values (private.pair_key(r.from_user, r.to_user))
    on conflict (pair_key) do update set status = 'active', ended_at = null, ended_by = null
    returning id into sid;
  insert into public.space_members (space_id, user_id) values (sid, r.from_user), (sid, r.to_user) on conflict do nothing;
  update public.collab_requests set status = 'accepted', responded_at = now() where id = r.id;
  return json_build_object('status', 'accepted', 'space_id', sid);
end $$;

create or replace function public.request_collab(p_target uuid, p_note text default null)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); s public.spaces%rowtype; rid uuid;
begin
  if p_target is null or p_target = uid or not exists (select 1 from public.profiles where id = p_target) then
    raise exception 'unknown_user' using errcode = '22023';
  end if;
  select * into s from public.spaces where pair_key = private.pair_key(uid, p_target);
  if found and s.status = 'active' then return json_build_object('status', 'already', 'space_id', s.id); end if;
  select id into rid from public.collab_requests where from_user = p_target and to_user = uid and status = 'pending';
  if found then return public.respond_request(rid, true); end if;          -- beide wollen: sofort verbunden
  if exists (select 1 from public.collab_requests where from_user = uid and to_user = p_target and status = 'pending') then
    return json_build_object('status', 'pending');
  end if;
  if exists (select 1 from public.collab_requests where from_user = uid and to_user = p_target and status = 'declined'
             and responded_at > now() - interval '24 hours') then
    return json_build_object('status', 'declined_recently');
  end if;
  if (select count(*) from public.collab_requests where from_user = uid and to_user = p_target
      and created_at > now() - interval '24 hours') >= 3 then
    return json_build_object('status', 'slow_down');                 -- höchstens 3 Anfragen je Paar und 24 h
  end if;
  if (select count(*) from public.collab_requests where from_user = uid and status = 'pending') >= 20 then
    raise exception 'too_many_requests' using errcode = '54000';
  end if;
  insert into public.collab_requests (from_user, to_user, note)
    values (uid, p_target, nullif(left(btrim(coalesce(p_note, '')), 140), ''));
  return json_build_object('status', 'sent');
end $$;

create or replace function public.cancel_request(p_request uuid)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid();
begin
  update public.collab_requests set status = 'cancelled', responded_at = now()
    where id = p_request and from_user = uid and status = 'pending';
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  return json_build_object('status', 'cancelled');
end $$;

create or replace function public.end_collab(p_space uuid)       -- Raum wird „beendet“: beide behalten Lesezugriff
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid();
begin
  if not exists (select 1 from public.space_members where space_id = p_space and user_id = uid) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  update public.spaces set status = 'ended', ended_at = now(), ended_by = uid where id = p_space and status = 'active';
  return json_build_object('status', 'ended');
end $$;

create or replace function public.invite_email(p_email text)   -- nur Verwalter; Einladen = Anfrage
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); e text := lower(btrim(coalesce(p_email, ''))); t uuid;
begin
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(e) > 254 then raise exception 'bad_email' using errcode = '22023'; end if;
  select u.id into t from auth.users u where lower(u.email) = e;
  if found then return public.request_collab(t); end if;            -- hat schon ein Konto: gleich anfragen
  if (select count(*) from private.signup_allowlist where invited_by = uid) >= 20 then
    raise exception 'too_many_invites' using errcode = '54000';
  end if;
  insert into private.signup_allowlist (email, invited_by) values (e, uid)
    on conflict (email) do update set invited_by = excluded.invited_by;
  return json_build_object('status', 'invited');
end $$;

-- Speichern mit optimistischer Sperre. Gibt json {status, id, version, ...} zurück; status:
--  created | ok | same (Wiederholung) | conflict | outdated (ältere App) | readonly (Raum beendet)
-- Fehler: 22023 bad_version (App/Format über private.settings) · 54000 too_large | quota | slow_down
-- p_client = Geräte-Kennung (KV cloud:device), p_origin = Herkunfts-Raum einer „Kopie in Nur ich“ (VO-E7)
create or replace function public.save_project(p_id uuid, p_base integer, p_title text, p_body json,
  p_format integer, p_app integer, p_space uuid default null, p_local_id text default null,
  p_client text default null, p_origin uuid default null)
returns json language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := private.need_uid();
  r public.projects%rowtype;
  t text := left(coalesce(nullif(btrim(p_title), ''), 'Projekt'), 60);
  cl text := left(coalesce(p_client, ''), 64);
  lim private.settings%rowtype;
  sz integer; h text; cur public.project_data%rowtype; nv integer;
  need_hand boolean; hand_sz integer := 0; left_b bigint; want_auto boolean; quota_hit boolean := false;
begin
  if p_id is null or p_body is null then raise exception 'bad_args' using errcode = '22023'; end if;
  select * into lim from private.settings;
  if coalesce(p_app, 0) > lim.max_app or coalesce(p_format, 0) > lim.max_format or coalesce(p_app, 0) < 0 or coalesce(p_format, 0) < 0 then
    raise exception 'bad_version' using errcode = '22023';            -- erfundene App-/Format-Nummer sperrt nie ein Projekt
  end if;
  sz := octet_length(p_body::text);
  if sz > 2000000 then raise exception 'too_large' using errcode = '54000'; end if;
  h := md5(p_body::text);
  select * into r from public.projects where id = p_id for update;
  if not found then                                                     -- neu anlegen
    if p_space is not null and p_space not in (select private.my_active_space_ids()) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    if p_origin is not null and (p_space is not null or p_origin not in (select private.my_space_ids())) then
      raise exception 'forbidden' using errcode = '42501';
    end if;
    if (select count(*) from public.projects p where p.owner_id = uid and p.created_at > now() - interval '1 day') >= 50 then
      raise exception 'slow_down' using errcode = '54000';             -- höchstens 50 neue Projekte je Tag
    end if;
    perform private.check_quota(uid, 2 * sz::bigint);                   -- Inhalt + erste Version
    insert into public.projects (id, owner_id, space_id, origin_space_id, local_id, title, version, format, app_code, size_bytes, updated_by)
      values (p_id, uid, p_space, p_origin, left(p_local_id, 64), t, 1, coalesce(p_format, 3), coalesce(p_app, 0), sz, uid);
    insert into public.project_data (project_id, version, body, body_md5) values (p_id, 1, p_body, h);
    insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by, client_id)
      values (p_id, 1, 'import', 'Erster Stand online', p_body, sz, uid, cl);
    return json_build_object('status', 'created', 'id', p_id, 'version', 1);
  end if;
  if not coalesce(r.owner_id = uid or r.space_id in (select private.my_space_ids()), false) then
    raise exception 'forbidden' using errcode = '42501';                -- fremdes Projekt
  end if;
  select * into cur from public.project_data where project_id = p_id;
  if cur.body_md5 = h then                                              -- gleicher Inhalt (z. B. verlorene Antwort)
    return json_build_object('status', 'same', 'id', p_id, 'version', r.version);
  end if;
  if not private.can_write(r.owner_id, r.space_id) then                 -- Raum beendet: Fassung trotzdem aufheben
    perform private.keep_conflict(p_id, coalesce(p_base, r.version), 'Nach Ende der Zusammenarbeit', cl, p_body, sz, uid);
    return json_build_object('status', 'readonly', 'id', p_id, 'version', r.version);
  end if;
  if coalesce(p_app, 0) < r.app_code or coalesce(p_format, 0) < r.format then   -- Versions-Wächter VO-R1
    perform private.keep_conflict(p_id, coalesce(p_base, r.version), 'Ältere App-Version', cl, p_body, sz, uid);
    return json_build_object('status', 'outdated', 'id', p_id, 'version', r.version, 'app_code', r.app_code, 'format', r.format);
  end if;
  if p_base is distinct from r.version then                             -- jemand war schneller: beide behalten
    perform private.keep_conflict(p_id, coalesce(p_base, 0), 'Gleichzeitig geändert', cl, p_body, sz, uid);
    return json_build_object('status', 'conflict', 'id', p_id, 'version', r.version,
      'updated_by', r.updated_by, 'updated_at', r.updated_at);
  end if;
  need_hand := r.updated_by is distinct from uid and not exists (select 1 from public.project_versions v
       where v.project_id = p_id and v.version = r.version and v.kind in ('handover', 'auto', 'import', 'manual'));
  if need_hand then hand_sz := octet_length(cur.body::text); end if;
  left_b := private.quota_left(uid) - hand_sz - greatest(sz - r.size_bytes, 0);
  if need_hand and left_b < 0 then raise exception 'quota' using errcode = '54000'; end if;   -- nichts überschrieben
  if need_hand then
    insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by)
      values (p_id, r.version, 'handover', 'Stand vor der Übernahme', cur.body, hand_sz, r.updated_by);
  end if;
  nv := r.version + 1;
  update public.project_data set version = nv, body = p_body, body_md5 = h where project_id = p_id;
  update public.projects set version = nv, title = t, format = greatest(r.format, coalesce(p_format, 0)),
    app_code = greatest(r.app_code, coalesce(p_app, 0)), size_bytes = sz, updated_at = now(), updated_by = uid
    where id = p_id;
  want_auto := not exists (select 1 from public.project_versions v where v.project_id = p_id and v.kind in ('auto', 'import')
                 and v.created_at > now() - interval '10 minutes');
  if want_auto and left_b < sz then quota_hit := true; want_auto := false; end if;   -- Quote voll: Stand speichern, Verlauf aussetzen
  if want_auto then
    insert into public.project_versions (project_id, version, kind, body, size_bytes, created_by, client_id)
      values (p_id, nv, 'auto', p_body, sz, uid, cl);
    perform private.thin_versions(p_id);
  end if;
  return json_build_object('status', 'ok', 'id', p_id, 'version', nv, 'trashed', r.deleted_at is not null, 'quota', quota_hit);
end $$;

create or replace function public.mark_version(p_project uuid, p_label text)   -- „Version merken“, auch vor Wiederherstellen
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); cur public.project_data%rowtype; vid bigint;
begin
  if p_project not in (select private.my_project_ids()) then raise exception 'not_found' using errcode = 'P0002'; end if;
  if (select count(*) from public.project_versions v where v.project_id = p_project and v.created_by = uid
        and v.kind = 'manual' and v.created_at > now() - interval '1 hour') >= 20 then
    raise exception 'slow_down' using errcode = '54000';               -- höchstens 20 je Projekt und Stunde
  end if;
  select * into cur from public.project_data where project_id = p_project;
  perform private.check_quota(uid, octet_length(cur.body::text));
  insert into public.project_versions (project_id, version, kind, label, body, size_bytes, created_by)
    values (p_project, cur.version, 'manual', left(coalesce(nullif(btrim(p_label), ''), 'Gemerkt'), 80), cur.body,
            octet_length(cur.body::text), uid)
    returning id into vid;
  return json_build_object('status', 'ok', 'version_id', vid);
end $$;

-- Eigene Sounds mit optimistischer Sperre (statt direktem Upsert): p_base = zuletzt gesehene Version (0 = noch keine)
create or replace function public.save_library(p_base integer, p_body json)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); l public.user_libraries%rowtype; sz integer;
begin
  if p_body is null then raise exception 'bad_args' using errcode = '22023'; end if;
  sz := octet_length(p_body::text);
  if sz > 2000000 then raise exception 'too_large' using errcode = '54000'; end if;
  select * into l from public.user_libraries where owner_id = uid for update;
  if not found then
    if coalesce(p_base, 0) <> 0 then return json_build_object('status', 'conflict', 'version', 0, 'body', null); end if;
    perform private.check_quota(uid, sz);
    insert into public.user_libraries (owner_id, version, body, size_bytes) values (uid, 1, p_body, sz);
    return json_build_object('status', 'ok', 'version', 1);
  end if;
  if p_base is distinct from l.version then                            -- anderes Gerät war schneller: zusammenführen, neu senden
    return json_build_object('status', 'conflict', 'version', l.version, 'body', l.body);
  end if;
  perform private.check_quota(uid, sz - l.size_bytes);
  update public.user_libraries set version = l.version + 1, body = p_body, size_bytes = sz, updated_at = now() where owner_id = uid;
  return json_build_object('status', 'ok', 'version', l.version + 1);
end $$;

create or replace function public.share_project(p_id uuid, p_space uuid)       -- „Nur ich“ -> Raum (nur Eigentümer)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); r public.projects%rowtype;
begin
  select * into r from public.projects where id = p_id for update;
  if not found or r.owner_id <> uid then raise exception 'not_found' using errcode = 'P0002'; end if;
  if r.space_id is not distinct from p_space then return json_build_object('status', 'same'); end if;
  if r.space_id is not null then raise exception 'already_shared' using errcode = '42501'; end if;   -- nie von Raum zu Raum
  if p_space is null or p_space not in (select private.my_active_space_ids()) then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if r.origin_space_id is not null and r.origin_space_id <> p_space then   -- Kopie mit Beiträgen aus einem anderen Raum
    return json_build_object('status', 'mixed_origin', 'origin_space_id', r.origin_space_id);
  end if;
  update public.projects set space_id = p_space, updated_at = now(), updated_by = uid where id = p_id;
  return json_build_object('status', 'shared', 'space_id', p_space);
end $$;

create or replace function public.trash_project(p_id uuid, p_trash boolean default true)
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid(); r public.projects%rowtype;
begin
  select * into r from public.projects where id = p_id for update;
  if not found or not coalesce(r.owner_id = uid or r.space_id in (select private.my_space_ids()), false) then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if not private.can_write(r.owner_id, r.space_id) then raise exception 'readonly' using errcode = '42501'; end if;
  update public.projects set deleted_at = case when p_trash then now() end, deleted_by = case when p_trash then uid end,
    updated_at = now(), updated_by = uid where id = p_id;
  return json_build_object('status', case when p_trash then 'trashed' else 'restored' end);
end $$;

create or replace function public.purge_project(p_id uuid)     -- endgültig: nur eigene, private, im Papierkorb
returns json language plpgsql security definer set search_path = '' as $$
declare uid uuid := private.need_uid();
begin
  delete from public.projects where id = p_id and owner_id = uid and space_id is null and deleted_at is not null;
  if not found then raise exception 'not_allowed' using errcode = '42501'; end if;
  return json_build_object('status', 'purged');
end $$;

create or replace function public.storage_report()           -- Quote für alle; Datenbank-Größe nur für Verwalter
returns json language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'db_bytes', case when private.is_admin() then pg_database_size(current_database()) end,
    'limit_bytes', case when private.is_admin() then 500 * 1024 * 1024 end,
    'my_projects', (select count(*) from public.projects p where p.owner_id = (select auth.uid())),
    'quota_bytes', (select s.quota_bytes from private.settings s),
    'quota_left', private.quota_left((select auth.uid())),
    'admin', private.is_admin())
$$;

create or replace function public.admin_thin(p_days integer default 90)   -- [Aufräumen]: auto-Versionen älter als p_days -> 1 je Woche
returns json language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  perform private.need_uid();
  if not private.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  delete from public.project_versions v
  where v.kind = 'auto' and v.created_at < now() - make_interval(days => greatest(coalesce(p_days, 90), 30))
    and v.id not in (
      select distinct on (x.project_id, date_trunc('week', x.created_at)) x.id from public.project_versions x
      where x.kind = 'auto' order by x.project_id, date_trunc('week', x.created_at), x.created_at desc);
  get diagnostics n = row_count;
  return json_build_object('status', 'ok', 'deleted', n);
end $$;

-- Sounds im Raum (VO3): Anzahl und Quote prüfen (direktes INSERT bleibt per RLS, der Trigger begrenzt)
create or replace function private.space_sounds_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.space_sounds x where x.owner_id = new.owner_id) >= 200 then
    raise exception 'slow_down' using errcode = '54000';
  end if;
  perform private.check_quota(new.owner_id, octet_length(new.body::text));
  return new;
end $$;
create trigger space_sounds_guard before insert on public.space_sounds for each row execute function private.space_sounds_guard();
revoke all on function private.space_sounds_guard(), private.keep_conflict(uuid, integer, text, text, json, integer, uuid),
  private.check_quota(uuid, bigint), private.quota_left(uuid), private.is_admin() from public, anon, authenticated;

revoke execute on function public.ping(), public.set_profile(text, boolean), public.find_user(text),
  public.respond_request(uuid, boolean), public.request_collab(uuid, text), public.cancel_request(uuid),
  public.end_collab(uuid), public.invite_email(text),
  public.save_project(uuid, integer, text, json, integer, integer, uuid, text, text, uuid),
  public.mark_version(uuid, text), public.save_library(integer, json), public.share_project(uuid, uuid),
  public.trash_project(uuid, boolean), public.purge_project(uuid), public.storage_report(), public.admin_thin(integer) from public, anon;
grant execute on function public.set_profile(text, boolean), public.find_user(text),
  public.respond_request(uuid, boolean), public.request_collab(uuid, text), public.cancel_request(uuid),
  public.end_collab(uuid), public.invite_email(text),
  public.save_project(uuid, integer, text, json, integer, integer, uuid, text, text, uuid),
  public.mark_version(uuid, text), public.save_library(integer, json), public.share_project(uuid, uuid),
  public.trash_project(uuid, boolean), public.purge_project(uuid), public.storage_report(), public.admin_thin(integer) to authenticated;
grant execute on function public.ping() to anon, authenticated;     -- für den optionalen Wach-Ping

-- ---------- 7. Realtime ----------
-- Postgres Changes nur für die kleinen Kopf-Tabellen (RLS gilt je Empfänger)
alter publication supabase_realtime add table public.projects, public.collab_requests, public.spaces;
-- Ohne DELETE: DELETE-Ereignisse sind nicht RLS-geprüft (S15) und würden IDs fremder, endgültig gelöschter
-- Projekte/Anfragen an jeden Angemeldeten senden. Die App braucht sie nicht (Löschen ist weich = UPDATE).
alter publication supabase_realtime set (publish = 'insert, update');
-- Presence/Broadcast (VO2-P1/VO3) nur auf privaten Kanälen 'space:<id>' eines aktiven eigenen Raums.
-- Dazu im Dashboard: Realtime → Settings → „Allow public access“ AUS.
create policy space_channel_read on realtime.messages for select to authenticated
  using (realtime.messages.extension in ('presence', 'broadcast') and private.topic_space_ok((select realtime.topic())));
create policy space_channel_write on realtime.messages for insert to authenticated
  with check (realtime.messages.extension in ('presence', 'broadcast') and private.topic_space_ok((select realtime.topic())));

-- ---------- 8. (Teil C, erst mit Audio/VS) Storage: privater Eimer je Raum-Ordner ----------
-- insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
--   values ('space-audio', 'space-audio', false, 52428800, array['audio/mp4', 'audio/webm', 'audio/mpeg']);
create policy space_audio_read on storage.objects for select to authenticated
  using (bucket_id = 'space-audio' and private.path_space_ok(name, false));
create policy space_audio_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'space-audio' and private.path_space_ok(name, true));
-- Kein DELETE für Nutzer (Review r7): gemeinsame Songs verweisen auf die Aufnahmen; Löschen nur beim
-- Verwalter-Aufräumen (service role), wenn kein Projekt-Inhalt und keine Version die Datei mehr nennt.
