FROM node:20.10.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production --legacy-peer-deps

COPY . .

EXPOSE 8000

# Run the app
CMD ["node", "server.js"]