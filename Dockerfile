FROM node:16

WORKDIR /app

# Copy package.json and package-lock.json
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend/ ./

# Expose the port the app runs on
EXPOSE 10000

# Command to run the app
CMD ["node", "server.js"]
