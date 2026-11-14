#!/bin/bash
# Publie chaque vidéo du catalogue sous son id (RTSP/HLS) et <id>_webrtc (transcodé).
RACINE=~/Desktop/mes_projets/streaming_lan
MEDIA=$RACINE/media; LOG=$RACINE/logs; mkdir -p "$LOG"
[ -f "$MEDIA/catalog.json" ] || { echo "catalog.json absent : lance scripts/build_catalog.py"; exit 1; }
pkill -f "ffmpeg.*rtsp://localhost:8554/" 2>/dev/null; sleep 1

LISTE=$(python3 - "$MEDIA/catalog.json" << 'PY'
import json, sys, urllib.parse
for i in json.load(open(sys.argv[1]))["items"]:
    if i["type"] == "video":
        print(i["id"], urllib.parse.unquote(i["paths"]["http"]), sep="\t")
PY
)
while IFS=$'\t' read -r id chemin; do
  [ -z "$id" ] && continue
  nohup ffmpeg -nostdin -re -stream_loop -1 -i "$MEDIA$chemin" -c copy \
    -f rtsp rtsp://localhost:8554/$id > "$LOG/$id.log" 2>&1 &
  nohup ffmpeg -nostdin -re -stream_loop -1 -i "$MEDIA$chemin" \
    -c:v libx264 -preset veryfast -tune zerolatency -bf 0 -g 30 \
    -c:a libopus -ar 48000 -ac 2 -b:a 64k \
    -f rtsp -rtsp_transport tcp rtsp://localhost:8554/${id}_webrtc > "$LOG/${id}_webrtc.log" 2>&1 &
  echo "publié : $id et ${id}_webrtc"
done <<< "$LISTE"
sleep 3; echo "Processus ffmpeg actifs : $(pgrep -fc 'ffmpeg.*8554')"
