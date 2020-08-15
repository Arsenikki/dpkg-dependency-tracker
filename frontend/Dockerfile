FROM node:14.8.0-alpine3.12

# Installing dependencies
COPY .next .
COPY package*.json ./
RUN yarn

# Copying source files
COPY . .

CMD ["yarn", "start"]