FROM node:16

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

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
