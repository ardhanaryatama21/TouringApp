FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck and verify npm
RUN apk add --no-cache curl bash
RUN node --version && npm --version

# Debug: Print current directory and list files
RUN echo "Current directory: $(pwd)" && ls -la

# Copy the entire repository
COPY . .

# Debug: Check if backend directory exists
RUN echo "Checking backend directory:" && ls -la && ls -la backend

# Install dependencies in the backend directory
WORKDIR /app/backend

# Debug: Print current directory before npm install
RUN echo "Current directory before npm install: $(pwd)"
RUN echo "Node and NPM versions:" && node --version && npm --version

# Install dependencies
RUN npm install

# Expose the port the app runs on
EXPOSE 10000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-10000}/api/health || curl -f http://localhost:${PORT:-10000}/health || exit 1

# Command to run the app
CMD ["node", "server.js"]
