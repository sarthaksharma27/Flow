FROM python:3.10-slim as python-builder

RUN apt-get update && apt-get install -y \
  ffmpeg git curl \
  build-essential libcairo2-dev pkg-config python3-dev libpango1.0-dev \
  && pip install --upgrade pip setuptools wheel \
  && pip install --no-cache-dir "Cython>=3.0.2,<3.1" \
  && pip install --no-cache-dir manim \
  && apt-get clean

FROM node:20

WORKDIR /app

COPY --from=python-builder /usr/local /usr/local
COPY --from=python-builder /usr/lib /usr/lib
COPY --from=python-builder /usr/bin /usr/bin

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["node", "dist/index.js"]
