# Use official Node.js LTS image
FROM node:24-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy all other source files
COPY . .

# Build project (if using a build step like Vite/TS)
RUN npm run build

# Expose port
EXPOSE 5000

# Run the app
CMD ["npm", "start"]
