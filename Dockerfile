# Verwende schlankes Node.js-Image als Basis
FROM node:16-slim

# Installiere Chromium und erforderliche Bibliotheken
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    fonts-liberation \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-glib-1-2 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libgbm-dev \
    libasound2 \
    ca-certificates \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Node.js-Abhängigkeiten (inkl. Puppeteer)
RUN npm install --unsafe-perm

# Kopiere restlichen Code
COPY . .

# Umgebungsvariablen für Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
ENV PUPPETEER_EXECUTABLE_PATH=/usr/src/app/node_modules/puppeteer/.local-chromium/linux-*/chrome-linux/chrome

# Exponiere den Port (anpassen, wenn nötig)
EXPOSE 3000

# Starte die Node.js-Anwendung
CMD ["node", "server.js"]
