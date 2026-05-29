FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache \
        python3 \
        build-base \
        cairo-dev \
        pango-dev \
        libjpeg-turbo-dev \
        libpng-dev \
        giflib-dev \
        libwebp-dev \
        freetype-dev \
        fontconfig-dev \
        pkgconfig \
        && rm -rf /var/cache/apk/* \
    && npm install

COPY tsconfig.json ./
COPY src/ ./src/
COPY workers/ ./workers/
COPY scripts/ ./scripts/

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache \
    chromium \
    fontconfig \
    freetype \
    ttf-freefont \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -S axion && adduser -S axion -G axion
USER axion

CMD ["node", "dist/src/index.js"]
