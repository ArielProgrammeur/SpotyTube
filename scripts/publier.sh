#!/bin/bash
VID=~/Desktop/mes_projets/streaming_lan/media/videos/fable.mp4
LOG=~/Desktop/mes_projets/streaming_lan/logs
mkdir -p "$LOG"
# Flux 1 : copie directe (RTSP, HLS)
nohup ffmpeg -nostdin -re -stream_loop -1 -i "$VID" -c copy \
  -f rtsp rtsp://localhost:8554/test > "$LOG/test.log" 2>&1 &
# Flux 2 : sans B-frames, audio Opus (WebRTC)
nohup ffmpeg -nostdin -re -stream_loop -1 -i "$VID" \
  -c:v libx264 -preset veryfast -tune zerolatency -bf 0 -g 30 \
  -c:a libopus -ar 48000 -ac 2 -b:a 64k \
  -f rtsp -rtsp_transport tcp rtsp://localhost:8554/test_webrtc > "$LOG/test_webrtc.log" 2>&1 &
sleep 2
echo "Flux lancés. Pour les arrêter : pkill -f 'rtsp://localhost:8554/test'"
