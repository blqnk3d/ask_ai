# Verwende ein Node.js-Image
FROM node:16

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest des Codes
COPY . .

# Installiere Puppeteer und seine Abhängigkeiten
RUN apt-get update && apt-get install -y \
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
    libgbm-dev \  # Füge diese Zeile hinzu
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Exponiere den Port
EXPOSE 3000

# Starte die Anwendung
CMD ["node", "server.js"]
