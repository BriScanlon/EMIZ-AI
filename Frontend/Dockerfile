# Stage 1: Install dependencies
FROM node:20-alpine AS build-env
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the React app
COPY . .
RUN npm run build

# Stage 3: Serve the React app using a lightweight server
FROM node:20-alpine
WORKDIR /app
COPY --from=build-env /app/dist ./dist
RUN npm install -g serve

# Serve the built frontend
CMD ["serve", "-s", "dist", "-l", "5173"]
