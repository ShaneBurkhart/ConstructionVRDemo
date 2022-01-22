FROM shaneburkhart/finish-vision-tailwind
ADD ./react /react
RUN npm run build

FROM shaneburkhart/finish-vision-lambda-queue

FROM node:17
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

WORKDIR /app

ENV NODE_OPTIONS="--max_old_space_size=2048 --openssl-legacy-provider"

COPY --from=0 /app /tailwind
COPY --from=1 /app /lambda-queue

ADD package.json /app/package.json
RUN npm install

ADD . /app/

RUN npm run build

EXPOSE 3000

CMD ["node", "websocket.js"]