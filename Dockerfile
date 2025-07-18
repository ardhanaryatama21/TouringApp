FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck and verify npm
RUN apk add --no-cache curl
RUN node --version && npm --version

# Copy the entire repository
COPY . .

# Install dependencies in the backend directory
WORKDIR /app/backend
RUN npm install

# Expose the port the app runs on
EXPOSE 10000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/api/health || curl -f http://localhost:${PORT:-10000}/health || exit 1

# Command to run the app
CMD ["node", "server.js"]
