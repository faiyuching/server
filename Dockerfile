#  Dockerfile for Node Koa Backend

FROM node:12.19.0-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --silent

COPY . .

EXPOSE 8000

CMD ["npm","start"]
