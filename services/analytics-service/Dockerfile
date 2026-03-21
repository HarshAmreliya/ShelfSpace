FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm config set fetch-timeout 300000 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci --ignore-scripts && node node_modules/esbuild/install.js
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm config set fetch-timeout 300000 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist ./dist

EXPOSE 3008
CMD ["node", "dist/index.js"]
