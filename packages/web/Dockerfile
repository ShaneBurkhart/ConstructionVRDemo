FROM shaneburkhart/finish-vision-tailwind
ADD ./react /react
RUN npm run build

FROM shaneburkhart/finish-vision-lambda-queue

FROM ruby
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get update && apt-get install -y nodejs npm

ENV NODE_OPTIONS=--max_old_space_size=2048

ADD Gemfile /app/Gemfile
RUN bundle install

COPY --from=0 /app /tailwind
COPY --from=1 /app /lambda-queue
ADD package.json /app/package.json
RUN npm install

ADD . /app/

RUN npm run build

EXPOSE 4567

CMD ["ruby", "server.rb"]
