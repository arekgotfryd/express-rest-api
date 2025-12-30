FROM node:23.6.1-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application
# Using --experimental-strip-types to run TypeScript files directly
CMD ["node", "--experimental-strip-types", "src/index.ts"]
