# Streaming multimédia sur réseau local

Conception et développement d'une application mobile de diffusion de contenus
multimédias (vidéo et audio) en streaming sur un réseau local.
Cours : protocoles multimédias et qualité.

## Objectifs

- Un serveur de diffusion multi-protocoles (HTTP, HLS, RTSP, WebRTC).
- Un client mobile (Expo / React Native) qui lit les vidéos et les fichiers audio.
- Une étude comparative des protocoles : temps de démarrage, latence, robustesse.

## Architecture

    Téléphone (app Expo)  --Wi-Fi-->  PC Ubuntu
                                      |- Nginx    : HTTP Range, catalogue   (8080)
                                      |- MediaMTX : RTSP 8554, HLS 8888, WebRTC 8889, RTMP 1935
                                      '- ffmpeg   : publie les fichiers en flux

Chaque vidéo est disponible en plusieurs protocoles à partir du même fichier source.

## Prérequis

Ubuntu, Docker avec Compose, ffmpeg, Python 3 (Node.js pour l'application).

## Démarrage rapide

    docker compose up -d        # lance MediaMTX et Nginx
    ./scripts/publier.sh        # publie les flux
    ./scripts/test_serveur.sh   # vérifie le serveur (15 tests attendus au vert)

Les médias ne sont pas versionnés : place les vidéos dans `media/videos/` et les
fichiers audio dans `media/audio/`.

## Structure du dépôt

| Dossier ou fichier | Contenu |
|---|---|
| `docker-compose.yml` | MediaMTX et Nginx |
| `server/` | `mediamtx.yml`, `nginx.conf` |
| `scripts/` | publication des flux, mesures, tests |
| `media/` | sources audio et vidéo (non versionnées) |
| `docs/` | mesures, décisions, journal |
| `app/` | application mobile (à venir) |

## Ports

| Service | Port | Transport |
|---|---|---|
| HTTP (Nginx) | 8080 | TCP |
| RTSP | 8554 | TCP, ou UDP pour les paquets RTP |
| HLS | 8888 | TCP |
| WebRTC | 8889 puis 8189 | TCP puis UDP |
| RTMP | 1935 | TCP |

## Documentation

- `docs/mesures.md` : résultats des mesures
- `docs/decisions.md` : pourquoi chaque choix a été fait
- `docs/journal.md` : journal de bord

## Conventions

Commits : `type(zone): description` (types : feat, fix, docs, test, refactor, chore).
Branches : `main` reste fonctionnelle ; une branche courte par tâche ; un tag par jalon.

## Avancement

- [x] Jour 1 : réseau local, IP, ports, HTTP
- [x] Jour 2 : MediaMTX, publication et lecture RTSP, HLS, WebRTC
- [x] Jour 3 : Nginx, HTTP Range, tests de fumée, accès depuis le téléphone
- [ ] Jour 4 : catalogue généré
- [ ] Application mobile, mesures de qualité, déploiement, rapport
