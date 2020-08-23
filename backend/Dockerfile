FROM node:14.8.0-alpine3.12

COPY package*.json ./

RUN yarn

COPY . .

CMD ["yarn", "start"]