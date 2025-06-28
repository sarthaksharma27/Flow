FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx tsc

CMD ["node", "dist/index.js"]
