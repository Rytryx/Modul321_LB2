# Verwende das offizielle Node.js 18 Image als Basis-Image
FROM node:18

# Setze das Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# Kopiere die package.json und package-lock.json Dateien in den Container
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Quellcode in den Container
COPY . .

# Exponiere den Port, auf dem die App läuft
EXPOSE 3000

# Definiere den Befehl zum Starten der App
CMD npm start
