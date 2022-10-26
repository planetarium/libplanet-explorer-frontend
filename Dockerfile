FROM node:latest AS build-env
WORKDIR /app

# Prepare the dependencies
COPY package.json \
     yarn.lock \
     .yarnrc.yml \
     /app/
COPY .yarn /app/.yarn
RUN mv .yarn .yarn-copied \
    && mkdir .yarn \
    && [ -e .yarn-copied/patches ] \
    && mv .yarn-copied/patches .yarn \
    ; [ -e .yarn-copied/plugins ] \
    && mv .yarn-copied/plugins .yarn \
    ; [ -e .yarn-copied/releases ] \
    && mv .yarn-copied/releases .yarn \
    ; [ -e .yarn-copied/sdks ] \
    && mv .yarn-copied/sdks .yarn \
    ; [ -e .yarn-copied/versions ] \
    && mv .yarn-copied/versions .yarn \
    ; rm -r .yarn-copied
RUN corepack enable && yarn && mv .yarn .yarn-back
# Copy everything else
COPY . /app
RUN rm -r .yarn && mv .yarn-back .yarn
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
# workaround for error:0308010C:digital envelope routines::unsupported
ENV NODE_OPTIONS --openssl-legacy-provider
RUN yarn build


# Host as static website
FROM nginx:alpine
COPY --from=build-env /app/public/. /usr/share/nginx/html


# Runtime settings
EXPOSE 80
