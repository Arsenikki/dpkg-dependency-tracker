FROM node:14.8.0-alpine3.12

COPY package*.json ./

RUN npm install --silent

COPY . .

CMD ["npm", "start"]