FROM node:24.2-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002
# CMD ["node", "index.js"]
CMD ["npm", "run", "dev"]
