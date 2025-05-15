# Use Node.js LTS version
FROM node:18

# Set the working directory
WORKDIR /app

# Copy only the order_handler package.json and package-lock.json
COPY ./package.json ./
COPY ./package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire order_handler directory
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Expose the port the app runs on
EXPOSE 3007

# Start the server
CMD ["node", "dist/server.js"]





