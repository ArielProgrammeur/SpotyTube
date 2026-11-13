# Mesures - Jour 2 (réseau sain, vidéo fable.mp4)

| Protocole | Port | Transport | Ouverture (ffprobe, real) | Démarrage (chrono) | Retard perçu | Son |
|---|---|---|---|---|---|---|
| RTSP | 8554 | UDP ou TCP (à confirmer) | ? | ? | ? | oui (AAC) |
| HLS | 8888 | HTTP / TCP | ? | ? | ? | oui (AAC) |
| WebRTC | 8889 + 8189 | UDP | ? | ? | ? | oui (Opus, flux transcodé) |

## Ouverture du flux (ffprobe, 3 essais, en secondes)
- RTSP : 1.076 / 1.087 / 0.891 (moyenne 1.02)
- HLS : 3.476 (démarrage à froid) / 0.086 / 0.087 (à chaud)
- WebRTC : environ 1 s (d'après le journal MediaMTX, précision à la seconde)

## RTSP : temps jusqu'à la première image (ffmpeg -frames:v 1, 6 essais)
- 1.777 / 3.596 / 1.712 / 0.946 / 2.600 / 3.688 (moyenne 2.39, min 0.95, max 3.69)
- Dispersion forte : attente de la prochaine image I (GOP du fichier), hypothèse à confirmer avec ffprobe

## GOP du fichier fable.mp4 (ffprobe, 10 premières images I)
- Instants : 0 / 2.10 / 6.13 / 8.90 / 12.77 / 15.63 / 17.17 / 19.50 / 21.30 / 24.63 s
- Écarts : 1.5 à 4.0 s, moyenne 2.74 s (GOP variable, scene cut)
- Attente moyenne prévue = E[G²]/(2E[G]) = 1.5 s ; démarrage prévu = 1.0 + 1.5 = 2.5 s ; mesuré (6 essais) = 2.39 s

## RTSP : série B (10 essais, ffmpeg -frames:v 1)
- moy=2.62 s, min=1.46 s, max=4.13 s
- Total 16 essais (séries A+B) : moyenne ≈ 2.53 s (prévu par la théorie du GOP : ≈ 2.5 s)
- Réserve : la base de ~1 s inclut le temps d'analyse de ffmpeg (outil), pas seulement le protocole

## HLS : temps jusqu'à la première image (10 essais)
- moy=0.78 s, min=0.24 s, max=4.62 s (max probablement un démarrage à froid)
- Interprétation : démarrage rapide car le lecteur HLS prend des segments déjà prêts (donc un peu dans le passé), à comparer avec la latence (Jour 10)

## Série finale (script mesure_demarrage.sh, 10 essais chacun, localhost)
| | RTSP | HLS |
|---|---|---|
| médiane | 2.02 s | 0.27 s |
| moyenne | 2.35 s | 0.81 s |
| min / max | 1.33 / 3.58 s | 0.19 / 5.59 s |
- HLS : le max (5.59 s) est probablement un démarrage à froid ; les 9 autres valent ~0.28 s en moyenne
- RTSP cumulé (26 essais) : moyenne ≈ 2.46 s
- Limite : mesures sur localhost, démarrage ≠ latence (à mesurer au Jour 10)
