# Brug Node.js LTS
FROM node:18

# Sæt korrekt arbejdsmappen
WORKDIR /app

# Kopiér dependencies først
COPY ../../package*.json ./

# Installer dependencies
RUN npm install
RUN npm install -D ts-node typescript @types/node

# Kopiér hele server-mappen ind (inkl. grocery_handler)
COPY ../../ ./server/mongo-sync-worker

# Skift til grocery_handler-mappen
WORKDIR /app/server/mongo-sync-worker

# Start consumer.js using node
CMD ["node", "consumer.js"]





