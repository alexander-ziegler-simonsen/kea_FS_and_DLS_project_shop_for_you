FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm install

# Copy remaining app files
COPY . .

# Build TypeScript
RUN npx tsc

EXPOSE 3005

# Run the app
CMD ["node", "dist/server.js"]



