FROM node:14.8.0-alpine3.12

# set workdir to be used
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN yarn

# Copying source files
COPY . .

CMD ["yarn", "start"]