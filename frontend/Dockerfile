# ---------- Stage 1: Build the client ----------
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Stage 2: Serve the built files ----------
FROM node:20-alpine AS serve

WORKDIR /app

# Install a lightweight static file server
RUN npm install -g serve

# Copy the build output from the previous stage
COPY --from=build /app/dist ./dist

# Expose Vercel’s default port
EXPOSE 3000

# Command to serve the static files
CMD ["serve", "-s", "dist", "-l", "3000"]
