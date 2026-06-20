# STAGE 1 — BUILD
FROM node:20-alpine AS builder

# SET WORKING DIRECTORY
WORKDIR /app

# COPY PACKAGE FILES
COPY package*.json ./

# INSTALL DEPENDENCIES
RUN npm install

# COPY ALL SOURCE FILES
COPY . .

# BUILD REACT APP
RUN npm run build

# STAGE 2 — SERVE
FROM nginx:alpine

# COPY BUILD OUTPUT TO NGINX
COPY --from=builder /app/dist /usr/share/nginx/html

# COPY NGINX CONFIG
COPY nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE PORT
EXPOSE 80

# START NGINX
CMD ["nginx", "-g", "daemon off;"]