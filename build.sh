#!/bin/bash
npm install
mkdir -p _site
echo "$DOMAIN" > _site/CNAME
while IFS=$'\t' read -r -a tuple; do
  {
    echo PATH_PREFIX="/${tuple[0]}"
    echo NETWORK_NAME="${tuple[0]}"
    echo GRAPHQL_ENDPOINT_URI="${tuple[1]}"
  } > .env.production
  npm run build
  mv public "_site/${tuple[0]}"
  if [[ ! -f _site/index.html ]]; then
    if [[ "${tuple[1]}" = https* ]]; then
      url="https://$DOMAIN/${tuple[0]}/"
    else
      url="http://$DOMAIN/${tuple[0]}/"
    fi
    echo "${tuple[0]} -> ${tuple[1]}"
    echo $url
    {
      echo '<!DOCTYPE html>'
      echo '<html><head><meta charset="utf-8">'
      echo '<meta http-equiv="refresh" content="0;' \
           "$url"'">'
      echo '<title>Libplanet Explorer</title>'
      echo '<link rel="canonical" href="'"$url"'">'
      echo '</head><body>'
      echo '</body>'
    } > _site/index.html
  fi
done < DEPLOYMENTS.tsv
