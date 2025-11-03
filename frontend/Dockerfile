# Use Node.js LTS
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve with a lightweight server
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]