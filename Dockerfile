FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package.json and package-lock.json first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the backend code only
COPY backend/ ./

# Print debug information
RUN echo "Current directory: $(pwd)" && ls -la
RUN node --version && npm --version

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Expose the port the app runs on
EXPOSE 10000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

# Command to run the app
CMD ["node", "server.js"]
