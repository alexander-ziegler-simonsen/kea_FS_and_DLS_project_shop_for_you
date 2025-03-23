# Use the official MongoDB base image
FROM mongo:latest

# Set the working directory to /docker-entrypoint-initdb.d
# MongoDB will automatically run scripts in this directory when starting the container
# we are jumping to this folder
WORKDIR /docker-entrypoint-initdb.d

# Copy the initialization script into the container
COPY mongo_init.sh /docker-entrypoint-initdb.d/

# Make sure the script is executable 
# RUN chmod +x /docker-entrypoint-initdb.d/mongo_init.sh
# EDIT - turns out... not needed and also don't work, since we don't have permissing to do that

# Expose MongoDB's default port
EXPOSE 27017

# start the init script
RUN /docker-entrypoint-initdb.d/mongo_init.sh

# Command to start MongoDB
#CMD ["mongod"]
