# Journal de bord

## Jour 1 : réseau et HTTP
- Serveur de test Python, accès depuis le téléphone, codes 200 et 404.
- Constat : l'adresse IP est dynamique (DHCP) et change selon le réseau Wi-Fi.

## Jour 2 : MediaMTX et protocoles
- Vidéo de test `fable.mp4` : H.264 (High), AAC, 576x1024, 30 images/s, 42,67 s, 592 kb/s.
- Publication en boucle avec ffmpeg, lecture RTSP, HLS et WebRTC.
- Démarrage (localhost, médiane) : RTSP 2,02 s ; HLS à chaud 0,26 s, à froid 5,59 s.
- Les images I de la vidéo sont espacées de 1,5 à 4,0 s, ce qui explique la dispersion du démarrage RTSP.
- WebRTC refuse le flux copié (B-frames, audio AAC) : décision D2.
- Transport RTSP : UDP par défaut, TCP quand on le force.

## Jour 3 : Nginx et HTTP Range
- Réponses vérifiées : 200 (fichier entier), 206 avec Content-Range, 416 hors limites.
- Index `moov` placé avant `mdat` : le fichier est déjà optimisé pour le streaming.
- Démarrage HTTP : médiane 0,13 s (10 essais).
- 15 tests de fumée au vert, accès depuis le téléphone confirmé.
- Compose validé par `down` puis `up -d` : décision D3.
