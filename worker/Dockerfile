# ---------- NODE BUILD STAGE ---------- 
FROM node:20 as node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- FINAL STAGE ----------
FROM python:3.10-slim
ENV DEBIAN_FRONTEND=noninteractive

# Install all dependencies (same as your python-builder stage)
RUN apt-get update && apt-get install -y \
  ffmpeg git curl \
  build-essential libcairo2-dev pkg-config python3-dev libpango1.0-dev \
  texlive-latex-base texlive-latex-extra texlive-fonts-recommended \
  texlive-fonts-extra texlive-science texlive-xetex \
  dvipng cm-super dvisvgm lmodern fonts-freefont-ttf \
  libgl1 libglib2.0-0 libxrender1 poppler-utils ghostscript \
  && pip install --upgrade pip setuptools wheel \
  && pip install --no-cache-dir "Cython>=3.0.2,<3.1" \
  && pip install --no-cache-dir manim

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# Copy built Node.js app from node-builder
COPY --from=node-builder /app/dist ./dist
COPY --from=node-builder /app/node_modules ./node_modules
COPY package*.json ./

CMD ["node", "dist/index.js"]