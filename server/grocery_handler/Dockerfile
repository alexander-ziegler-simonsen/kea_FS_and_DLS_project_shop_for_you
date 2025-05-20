FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json tsconfig.json ./
RUN npm install

# Install TypeScript globally (for tsc build)
RUN npm install -g typescript

# Copy remaining app files
COPY . .

# Build TypeScript using tsc (like user_handler)
RUN tsc

EXPOSE 3005

# Run the compiled JavaScript file
CMD ["node", "dist/server.js"]



