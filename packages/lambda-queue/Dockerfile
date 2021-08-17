FROM node:15.14.0
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

WORKDIR /app

ADD package.json /app/package.json
RUN npm install

ADD . /app/
