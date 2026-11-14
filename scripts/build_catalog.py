#!/usr/bin/env python3
"""Génère media/catalog.json à partir de media/videos et media/audio."""
import json, re, subprocess, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

MEDIA = Path(__file__).resolve().parent.parent / "media"
EXT = {"video": {".mp4", ".mov", ".mkv"}, "audio": {".mp3", ".m4a", ".aac", ".ogg", ".wav"}}

def slug(nom):
    s = unicodedata.normalize("NFKD", nom).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_") or "media"

def sonde(chemin):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_format", "-show_streams",
                        "-of", "json", str(chemin)], capture_output=True, text=True)
    return json.loads(r.stdout) if r.returncode == 0 else None

def vignette(chemin, id_):
    (MEDIA / "thumbs").mkdir(exist_ok=True)
    sortie = MEDIA / "thumbs" / f"{id_}.jpg"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", "1", "-i", str(chemin),
                    "-frames:v", "1", "-vf", "scale=320:-2", str(sortie)])
    return f"/thumbs/{id_}.jpg" if sortie.exists() else None

items, vus = [], set()
for type_, dossier in (("video", "videos"), ("audio", "audio")):
    for f in sorted((MEDIA / dossier).iterdir()):
        if f.suffix.lower() not in EXT[type_]:
            continue
        info = sonde(f)
        if not info:
            print("ignoré (illisible) :", f.name); continue
        id_, n = slug(f.stem), 2
        while id_ in vus:
            id_ = f"{slug(f.stem)}_{n}"; n += 1
        vus.add(id_)
        flux = {s["codec_type"]: s for s in info["streams"]}
        fmt = info["format"]
        item = {"id": id_, "type": type_, "title": f.stem.replace("_", " "),
                "duration": round(float(fmt["duration"]), 2),
                "size_bytes": int(fmt["size"]),
                "bitrate_kbps": round(int(fmt.get("bit_rate", 0)) / 1000),
                "audio_codec": flux["audio"]["codec_name"] if "audio" in flux else None,
                "paths": {"http": f"/{dossier}/{quote(f.name)}"}}
        if type_ == "video":
            v = flux["video"]
            item.update(video_codec=v["codec_name"], width=v["width"], height=v["height"],
                        thumbnail=vignette(f, id_))
            item["paths"].update(hls=f"/{id_}/index.m3u8", rtsp=f"/{id_}", webrtc=f"/{id_}_webrtc")
        items.append(item)

catalogue = {"version": 1,
             "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
             "protocols": {"http": {"scheme": "http", "port": 8080},
                           "hls": {"scheme": "http", "port": 8888},
                           "rtsp": {"scheme": "rtsp", "port": 8554},
                           "webrtc": {"scheme": "http", "port": 8889}},
             "items": items}
(MEDIA / "catalog.json").write_text(json.dumps(catalogue, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"{len(items)} média(s) dans media/catalog.json :", ", ".join(i["id"] for i in items))
