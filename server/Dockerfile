# USE NODE 18 SMALL VERSION
FROM node:20-alpine
# alpine = lightweight Linux, only 5MB
# without alpine = 900MB, with alpine = 50MB

# GO TO THIS FOLDER INSIDE CONTAINER
WORKDIR /app
# like cd /app inside the container

# COPY package.json FIRST
COPY package*.json ./
# we copy this first because of Docker caching
# if package.json didn't change, skip npm install
# saves time on every rebuild

# INSTALL DEPENDENCIES
RUN npm install
# runs inside container, not your machine

# COPY ALL YOUR CODE
COPY . .
# copies server/src, models, routes etc

# TELL DOCKER THIS APP USES PORT 5000
EXPOSE 5000
# just documentation, does not actually open port

# START THE SERVER
CMD ["node", "src/server.js"]
# this runs when container starts