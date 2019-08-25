.PHONY: db build react
NAME=construction-vr-demo
IMAGE_TAG=shaneburkhart/${NAME}

all: run

run:
	docker-compose -p ${NAME} up -d

build:
	docker build -t ${IMAGE_TAG} -f Dockerfile .

react:
	docker-compose -p ${NAME} run --rm web make build_react

build_react:
	./node_modules/.bin/babel --presets=@babel/preset-react,@babel/preset-env --plugins=css-modules-transform -d build --copy-files react
	./node_modules/.bin/browserify build/index.js -o public/finishes-app.js

db:
	docker-compose -p ${NAME} run --rm web_prod rake db:migrate

c:
	docker-compose -p ${NAME} run --rm web /bin/bash

db_models:
	docker-compose -p ${NAME} run --rm web irb -r ./models/db_models.rb

clean:
	docker-compose -p ${NAME} down || true
	docker-compose -p ${NAME} rm -f || true

ps:
	docker-compose ps

logs:
	docker-compose -p ${NAME} logs -f

rerun_photos:
	docker-compose -p ${NAME} run --rm web_prod /app/scripts/rerun-photos.rb

prod:
	git checkout master
	git pull origin master
	$(MAKE) build
	$(MAKE) clean
	$(MAKE) run
	$(MAKE) db
	$(MAKE) run

deploy_prod:
	ssh -A ubuntu@construction-vr.shaneburkhart.com "cd ~/ConstructionVRDemo; make prod;"

