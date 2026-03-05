

# # # Use Node.js LTS version as base image
# # FROM node:lts-alpine AS build


# # ENV NODE_OPTIONS=--max_old_space_size=4096


# # # Set the working directory in the container
# # WORKDIR /app

# # # Copy package.json and yarn.lock to the container
# # COPY package.json ./

# # # Install build essentials
# # RUN apk add --no-cache build-base

# # # Install dependencies
# # RUN npm install

# # # Copy the rest of the application code to the container
# # COPY . .

# # # Build the React app
# # RUN npm run build

# # # Use a smaller Nginx image for serving the static files
# # FROM nginx:alpine

# # # Copy built app to nginx public directory
# # COPY --from=build /app/dist /usr/share/nginx/html

# # #https://apinursing.softlytica.com
# # # Expose port 80
# # EXPOSE 80

# # # Command to run the nginx server
# # CMD ["nginx", "-g", "daemon off;"]


# # Build stage
# FROM node:lts-alpine AS build

# ENV NODE_OPTIONS=--max_old_space_size=4096
# WORKDIR /app

# # Install build essentials
# RUN apk add --no-cache build-base

# # Copy manifests first (better caching)
# COPY package.json package-lock.json ./


# # Deterministic install
# RUN npm ci



# # Copy the rest (node_modules must be excluded via .dockerignore)
# COPY . .


# # Safety: ensure esbuild binary matches package version
# RUN npm rebuild esbuild

# # Build the React app
# RUN npm run build


# # Runtime stage
# FROM nginx:alpine

# COPY --from=build /app/dist /usr/share/nginx/html
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]
# Build stage
FROM node:lts-alpine AS build

ENV NODE_OPTIONS=--max_old_space_size=4096
WORKDIR /app

# Build deps
RUN apk add --no-cache build-base

# Copy manifests first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest
COPY . .

# ---- Build-time env (recommended) ----
# Pass values during docker build:
#   docker build --build-arg VITE_API_URL="https://api.example.com" -t dashboard-image-jh .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Safety: ensure esbuild binary matches package version
RUN npm rebuild esbuild

# Build the React/Vite app
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Optional: custom nginx config (uncomment if you have one)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
