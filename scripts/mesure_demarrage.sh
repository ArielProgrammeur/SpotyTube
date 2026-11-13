#!/bin/bash
[ $# -lt 2 ] && { echo "Usage : $0 NOM URL [N]"; exit 1; }
# Usage : ./mesure_demarrage.sh NOM URL [N]
nom=$1; url=$2; n=${3:-10}
TIMEFORMAT=%R
vals=()
for i in $(seq 1 "$n"); do
  v=$( { time ffmpeg -nostdin -v error -i "$url" -frames:v 1 -f null - ; } 2>&1 | tail -1 )
  vals+=("$v")
  echo "$nom,$i,$v" >> ~/Desktop/mes_projets/streaming_lan/docs/resultats.csv
done
printf '%s\n' "${vals[@]}" | sort -n | awk -v nom="$nom" '{a[NR]=$1; s+=$1} END{med=(NR%2)?a[(NR+1)/2]:(a[NR/2]+a[NR/2+1])/2; printf "%s : moy=%.2f médiane=%.2f min=%.2f max=%.2f (n=%d)\n", nom, s/NR, med, a[1], a[NR], NR}'
