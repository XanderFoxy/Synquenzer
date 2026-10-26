// QA FP-SICHER MK7 (local PGlite + Supabase shim, never the live project): version guard for App 4.15.0 / format 5 and a project
// body that carries tr.mkIn (E1/E2) and an AM vocoder sound with voc.hold is stored unchanged by save_project.
import fs from 'fs';
const D = new URL('..', import.meta.url).pathname;
const {PGlite} = await import(D + 'qa-pglite/node_modules/@electric-sql/pglite/dist/index.js');
const SQL = fs.readFileSync(D + 'v3-ideen/r7/online-schema.sql', 'utf8');
const html = fs.readFileSync(D + 'mk-br-MK7/index.html', 'utf8');
const ver = /const VERSION = '([0-9.]+)'/.exec(html)[1], v = ver.split('.').map(Number), APP = v[0] * 1e6 + v[1] * 1e3 + v[2], FMT = +/PROJECT_FORMAT = (\d+)/.exec(html)[1];
console.log('App ' + ver + ' = ' + APP + ', format ' + FMT);
const db = new PGlite();
await db.exec(`create role anon nologin; create role authenticated nologin; create role service_role nologin; create role supabase_auth_admin nologin;
create schema auth; create schema extensions;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb, created_at timestamptz default now());
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function auth.role() returns text language sql stable as $$ select current_setting('request.jwt.claim.role', true) $$;
create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated;
create publication supabase_realtime;
create schema realtime; create table realtime.messages (id bigserial primary key, topic text, extension text, payload jsonb, private boolean default true);
alter table realtime.messages enable row level security;
create or replace function realtime.topic() returns text language sql stable as $$ select current_setting('realtime.topic', true) $$;
create schema storage; create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid, metadata jsonb);
alter table storage.objects enable row level security;
create or replace function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
grant usage on schema realtime, storage to authenticated;`);
await db.exec(SQL);
await db.exec(`update private.settings set max_app = 4021000, max_format = 5`);
const uid = '11111111-1111-1111-1111-111111111111';
await db.exec(`insert into auth.users (id, email) values ('${uid}', 'a@example.org')`);
const body = JSON.stringify({app: 'SYNQUENZER', format: FMT, tracks: [{kind: 'synth', uid: 'abcdefghij', mkIn: {e1: null, e2: 'mic', e1Dry: 1, e2Dry: 0}, sound: {engine: 'mk', p: {mk: {mode: 3, voc: {hold: new Array(16).fill(64), chl: new Array(16).fill(127)}}}}}, {kind: 'synth', uid: 'klmnopqrst', mkIn: {e1: 't:abcdefghij', e2: null, e1Dry: 0, e2Dry: 1}}]});
const call = async (app, fmt, id, b) => {
  try {
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false); select set_config('request.jwt.claim.role', 'authenticated', false);`);
    const r = await db.query(`select public.save_project($1::uuid, null, 'T', $4::json, $2, $3) as r`, [id, fmt, app, b || '{"a":1}']);
    await db.exec('reset role'); return JSON.stringify(r.rows[0].r);
  } catch (e) { await db.exec('reset role'); return 'ERR ' + e.message; }
};
console.log('App ' + APP + ' / format ' + FMT + ' with mkIn/voc body:', await call(APP, FMT, '22222222-2222-2222-2222-222222222222', body));
const back = await db.query(`select body::text as b from public.project_data where project_id = '22222222-2222-2222-2222-222222222222'`);
console.log('stored body identical:', back.rows.length ? JSON.stringify(JSON.parse(back.rows[0].b)) === body : 'no row');
console.log('4 021 001 / 5 (guard):', await call(4021001, 5, '44444444-4444-4444-4444-444444444444'));
console.log('App / format 6 (guard):', await call(APP, 6, '55555555-5555-5555-5555-555555555555'));
