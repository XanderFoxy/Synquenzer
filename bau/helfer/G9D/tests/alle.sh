#!/bin/sh
# alle G9D-Tests nacheinander (aus diesem Ordner): node build.mjs vorher, wenn src/ geändert wurde
cd "$(dirname "$0")" || exit 1
for t in t2-ops t3-ui t4-platz t5-alt t6-probe t7-dock-f3 t8-g3 t9-pruefer t10-g9d; do echo "== $t"; timeout 900 node $t.mjs | tail -1; done
