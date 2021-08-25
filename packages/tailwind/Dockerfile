FROM node:15.14.0
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

WORKDIR /app

ADD . /app/

RUN npm install

RUN npm run build

CMD ["npm", "start"]
