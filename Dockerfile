FROM node:latest AS build-env
WORKDIR /app

# Prepare the dependencies
COPY package.json \
     yarn.lock \
     .yarnrc.yml \
     /app/
COPY .yarn /app/.yarn
RUN corepack enable && yarn
# Copy everything else
COPY . /app
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
# workaround for error:0308010C:digital envelope routines::unsupported
ENV NODE_OPTIONS --openssl-legacy-provider
RUN yarn build


# Host as static website
FROM nginx:alpine
COPY --from=build-env /app/out/. /usr/share/nginx/html


# Runtime settings
EXPOSE 80
