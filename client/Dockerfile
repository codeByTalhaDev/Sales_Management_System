# STAGE 1 — BUILD
FROM node:18-alpine AS builder
# we name this stage "builder"

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# BUILD REACT APP
RUN npm run build
# creates /app/dist folder with HTML, CSS, JS files
# React is now plain HTML files, no Node.js needed

# STAGE 2 — SERVE
FROM nginx:alpine
# throw away Node.js, we don't need it anymore
# only keep the built files

# COPY BUILT FILES INTO NGINX
COPY --from=builder /app/dist /usr/share/nginx/html
# take dist folder from builder stage
# put it where nginx serves files from

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]