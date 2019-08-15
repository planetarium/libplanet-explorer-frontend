FROM node:latest AS build-env
WORKDIR /app

# Prepare the dependencies
COPY package*.json /app/
RUN npm install && npm cache clean --force

# Copy everything else
COPY . /app

# Runtime settings
EXPOSE 8000

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

ENTRYPOINT ["npm", "run", "dev"]
