#!/bin/bash
# Tests de fumée du serveur de streaming. Usage : ./test_serveur.sh [hote]
# Variables modifiables : NGINX_PORT (8080 par défaut), MEDIA_PATH (chemin d'une vidéo côté Nginx)
HOST=${1:-localhost}
NGINX_PORT=${NGINX_PORT:-8080}
MEDIA_PATH=${MEDIA_PATH:-/videos/fable.mp4}
ok=0; ko=0

run() {
  local nom="$1"; shift
  if "$@" >/dev/null 2>&1; then echo "  ✔ $nom"; ok=$((ok+1)); else echo "  ✘ $nom"; ko=$((ko+1)); fi
}

t_conteneur()   { docker ps --format '{{.Names}}' | grep -qx mediamtx; }
t_tcp()         { ss -tln | grep -q ":$1 "; }
t_udp()         { ss -uln | grep -q ":$1 "; }
t_publieur()    { pgrep -f "ffmpeg.*8554/test"; }
t_rtsp_test()   { timeout 20 ffprobe -v error -rtsp_transport tcp -show_entries stream=codec_name -of csv=p=0 "rtsp://$HOST:8554/test" | grep -q h264; }
t_rtsp_opus()   { timeout 20 ffprobe -v error -rtsp_transport tcp -show_entries stream=codec_name -of csv=p=0 "rtsp://$HOST:8554/test_webrtc" | grep -q opus; }
t_hls()         { timeout 30 ffmpeg -nostdin -v error -i "http://$HOST:8888/test/index.m3u8" -frames:v 1 -f null -; }
t_webrtc_page() { curl -s -o /dev/null -w '%{http_code}' "http://$HOST:8889/test_webrtc" | grep -qE '^(200|302)$'; }
t_nginx()       { curl -s -o /dev/null -w '%{http_code}' "http://$HOST:$NGINX_PORT$MEDIA_PATH" | grep -qx 200; }
t_accept()      { curl -sI "http://$HOST:$NGINX_PORT$MEDIA_PATH" | grep -qi 'accept-ranges: bytes'; }
t_range()       { curl -s -o /dev/null -w '%{http_code}' -r 0-99 "http://$HOST:$NGINX_PORT$MEDIA_PATH" | grep -qx 206; }
t_416()         { curl -s -o /dev/null -w '%{http_code}' -r 999999999999- "http://$HOST:$NGINX_PORT$MEDIA_PATH" | grep -qx 416; }

echo "A. MediaMTX (doit passer maintenant)"
run "Conteneur mediamtx en marche"        t_conteneur
run "Port RTSP 8554/tcp"                  t_tcp 8554
run "Port RTMP 1935/tcp"                  t_tcp 1935
run "Port HLS 8888/tcp"                   t_tcp 8888
run "Port WebRTC 8889/tcp"                t_tcp 8889
run "Port WebRTC média 8189/udp"          t_udp 8189
run "Publieur ffmpeg actif"               t_publieur
run "RTSP : flux test (H.264)"            t_rtsp_test
run "RTSP : flux test_webrtc (audio Opus)" t_rtsp_opus
run "HLS : première image décodée"        t_hls
run "WebRTC : page du lecteur"            t_webrtc_page
echo "B. Nginx (Jour 3)"
run "Nginx répond 200 sur $MEDIA_PATH"    t_nginx
run "En-tête Accept-Ranges: bytes"        t_accept
run "Requête Range -> 206"                t_range
run "Range hors limites -> 416"           t_416
echo; echo "Résultat : $ok réussis, $ko échoués"
[ "$ko" -eq 0 ]
