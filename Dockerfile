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
RUN yarn codegen \
    && yarn build \
    && yarn export


# Host as static website
FROM nginx:alpine
COPY --from=build-env /app/out/. /usr/share/nginx/html


# Runtime settings
EXPOSE 80
