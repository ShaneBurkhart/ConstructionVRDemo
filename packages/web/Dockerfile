FROM ruby
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

WORKDIR /app

RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update && apt-get install -y nodejs

ADD Gemfile /app/Gemfile
RUN bundle install

ADD package.json /app/package.json
RUN npm install

ADD . /app/

RUN npm run build

EXPOSE 4567

CMD ["ruby", "server.rb"]
