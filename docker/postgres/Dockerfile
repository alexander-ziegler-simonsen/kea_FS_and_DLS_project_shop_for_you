# Use the official rabbitmq base image
FROM postgres:latest

# Set the working directory to /docker-entrypoint-initdb.d
WORKDIR /docker-entrypoint-initdb.d

# Copy the initialization script into the container
# COPY init.sh /docker-entrypoint-initdb.d/
COPY .env /docker-entrypoint-initdb.d/

# Expose postgres's default port
EXPOSE 5432

