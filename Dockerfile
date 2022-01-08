FROM node:14-alpine

WORKDIR /usr/src/app

ADD . .

RUN npm install -g node-gyp
RUN npm install

CMD ["npm", "start"]
