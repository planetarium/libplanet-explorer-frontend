#!/bin/bash
# Cloudflare Pages deploy script

# Install deps
yarn

# Export endpoint uris to .env.production
COUNT=0
VAR_ENV="NEXT_PUBLIC_GRAPHQL_ENDPOINTS=["

while IFS=$'\t' read -r -a tuple; do
  (( COUNT++ ))
  if [ "$COUNT" != 1 ]; then VAR_ENV+=","; fi
  VAR_ENV+="{\"name\": \"${tuple[0]}\", \"uri\": \"${tuple[1]}\"}"
done < DEPLOYMENTS.tsv

VAR_ENV+="]";
echo "$VAR_ENV" > ".env.production"

# Then build Gatsby site into public (default path)
yarn build

# Export CNAME
echo "$DOMAIN" > public/CNAME

# Rename public to _site
mv public _site
