#!/bin/sh
# baut bau/helfer/UECD/index.html neu aus bau/snapshots/R-4300.html + werkzeug/ue-block.js + werkzeug/ue-ui.js
cd "$(dirname "$0")/../../../.." && python3 bau/helfer/UECD/werkzeug/einbau.py bau/snapshots/R-4300.html bau/helfer/UECD/werkzeug/ue-block.js bau/helfer/UECD/werkzeug/ue-ui.js bau/helfer/UECD/index.html
