# Use Node LTS base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json from build context (which is ./server)
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install -D ts-node typescript @types/node

# Copy entire server/ folder contents
COPY . . 

# Set working dir to create_grocery
WORKDIR /app/create_grocery 

# Expose port
EXPOSE 3000

# Run server.ts using ts-node
CMD ["node", "--loader", "ts-node/esm", "server.ts"]

