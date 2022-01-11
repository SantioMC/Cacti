FROM node:14-alpine

WORKDIR /usr/src/app

ADD . .

RUN apk --no-cache --virtual build-dependencies add \
    python \
    make \
    g++ \
    && npm install \
    && apk del build-dependencies
RUN npm install

CMD ["npm", "start"]
