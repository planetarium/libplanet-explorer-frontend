#!/bin/bash

# Install deps
npm install

# Prepare build directory
mkdir -p _site

# Export CNAME
echo "$DOMAIN" > _site/CNAME

# Export endpoint uris to .env.production
COUNT=0
VAR_ENV="GRAPHQL_ENDPOINTS=["

while IFS=$'\t' read -r -a tuple; do
  (( COUNT++ ))
  if [ "$COUNT" != 1 ]; then VAR_ENV+=","; fi
  VAR_ENV+="{\"name\": \"${tuple[0]}\", \"uri\": \"${tuple[1]}\"}"
done < DEPLOYMENTS.tsv

VAR_ENV+="]";
echo "$VAR_ENV" > ".env.production"

# Then build Gatsby site
npm run build
