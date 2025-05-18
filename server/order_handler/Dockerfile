FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Install ts-node
RUN npm install ts-node

# Copy remaining app files
COPY . .

# Compile TypeScript files
RUN tsc

EXPOSE 3007

# Run the compiled JavaScript file
CMD ["node", "dist/server.js"]





