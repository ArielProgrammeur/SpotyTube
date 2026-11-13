# Décisions d'architecture

Chaque décision : contexte, choix, raison, preuve.

## D1. MediaMTX pour les protocoles temps réel, Nginx pour HTTP
- Contexte : le cours porte sur les protocoles multimédias, il faut en comparer plusieurs.
- Choix : MediaMTX (RTSP, HLS, WebRTC, RTMP) et Nginx (HTTP progressif, référence).
- Raison : un seul contenu disponible dans plusieurs protocoles, donc une comparaison équitable.
- Limite : un fichier publié par ffmpeg se comporte comme un direct en boucle (pas d'avance rapide en RTSP).

## D2. WebRTC : un second flux transcodé
- Constat : la lecture WebRTC de la vidéo copiée échoue (journal MediaMTX : B-frames refusées, audio AAC ignoré).
- Choix : flux séparé `*_webrtc`, recompressé sans B-frames avec audio Opus.
- Raison : WebRTC vise une latence sous la seconde, donc impose ces contraintes de codec.
- Preuve : lecture avec image et son sur le flux transcodé.

## D3. Déploiement par Docker Compose
- Constat : un conteneur lancé avec `docker run` n'utilisait pas `server/mediamtx.yml`.
- Choix : tout est décrit dans `docker-compose.yml`, conteneurs nommés.
- Raison : démarrage reproductible en une commande.
- Preuve : `docker compose down` puis `up -d`, puis 15 tests au vert.

## D4. Mesurer avec la médiane, séparer démarrage à froid et à chaud
- Constat : un démarrage HLS à froid (5,59 s) tire la moyenne vers le haut (0,81 s contre 0,26 s pour la médiane).
- Choix : rapporter médiane, min et max, et traiter le démarrage à froid à part.

## D5. Le catalogue ne contient jamais d'adresse IP
- Constat : l'IP du PC a changé trois fois en quelques jours.
- Choix : l'adresse du serveur est saisie dans l'application ; le catalogue ne contient que ports et chemins.
