#!/bin/sh
# legt tests/node_modules an (Verweise auf die global installierten Pakete: playwright aus npm root -g, acorn & Co. aus /opt/node-tools)
# ES-Module lesen NODE_PATH nicht – darum Verweise. Der Ordner steht in .gitignore.
H="$(cd "$(dirname "$0")" && pwd)"; M="$H/node_modules"; mkdir -p "$M"
for R in /opt/node-tools/node_modules "$(npm root -g)"; do [ -d "$R" ] || continue
  for p in "$R"/* "$R"/@*/*; do [ -e "$p" ] || continue; n="${p#$R/}"; case "$n" in @*/*) mkdir -p "$M/${n%%/*}";; esac; ln -sfn "$p" "$M/$n"; done
done
