# Stage 1: Install all dependencies (including devDependencies)
FROM node:20-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# Stage 2: Install only production dependencies (for final runtime)
FROM node:20-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# Stage 3: Build the Vite React app
FROM node:20-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app

# Ensure Vite is installed before running the build (if missing)
RUN npm install vite -g
RUN npm install
RUN npm run build

# Stage 4: Create a minimal final runtime image
FROM node:20-alpine
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/dist /app/dist
WORKDIR /app

# Serve the built app
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
