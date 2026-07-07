# syntax = docker/dockerfile:1.2
FROM docker.io/oven/bun:1.2-alpine as build
LABEL stage=build
WORKDIR /iceshrimp

# Install compilation dependencies
RUN apk add --no-cache --no-progress git alpine-sdk python3 py3-setuptools linux-headers

# Copy package files + bunfig (нужен для @iceshrimp scoped registry)
COPY package.json bunfig.toml ./
COPY packages/backend/package.json packages/backend/
COPY packages/client/package.json packages/client/
COPY packages/sw/package.json packages/sw/
COPY packages/iceshrimp-sdk/package.json packages/iceshrimp-sdk/

# Install dependencies
RUN bun install

# Copy source
COPY . .

# Build
RUN NODE_ENV=production bun run build

# Optimize (brotli)
RUN NODE_ENV=production bun run build:optimize

## Runtime container
FROM docker.io/oven/bun:1.2-alpine
LABEL stage=runtime
WORKDIR /iceshrimp

# Install runtime dependencies
RUN apk add --no-cache --no-progress tini ffmpeg zip unzip libheif-dev

# Copy built files
COPY --from=build /iceshrimp /iceshrimp

ENV NODE_ENV=production
VOLUME "/iceshrimp/files"
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "bun", "run", "migrateandstart" ]
