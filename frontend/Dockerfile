# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the frontend (Vite bakes in the .env variables during this step)
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for Cloud Run
EXPOSE 80

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
