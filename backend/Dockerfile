FROM node:20-alpine as build
WORKDIR /app

# Update npm to the latest version to avoid legacy issues
RUN npm install -g npm@latest

COPY package*.json ./
RUN npm ci
COPY . .

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app .
CMD ["node", "index.js"]