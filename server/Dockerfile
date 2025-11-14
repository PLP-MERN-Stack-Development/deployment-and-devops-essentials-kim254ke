# ---------- Stage 1: Build the client ----------
FROM node:20-alpine AS client-build

WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ .
RUN npm run build


# ---------- Stage 2: Build and run the server ----------
FROM node:20-alpine AS server

WORKDIR /app

# Copy and install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server source
COPY server ./server

# Copy built client into server's public folder
COPY --from=client-build /app/client/dist ./server/public

# Expose backend port (Railway detects this automatically)
EXPOSE 5000

# Start the server
CMD ["npm", "start", "--prefix", "server"]
