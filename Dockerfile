FROM buildkite/puppeteer:latest

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere Node.js-Abhängigkeiten (inkl. Puppeteer)
RUN npm install --unsafe-perm

# Kopiere restlichen Code
COPY . .

# Exponiere den Port (anpassen, wenn nötig)
EXPOSE 3000

# Starte die Node.js-Anwendung
CMD ["node", "server.js"]
