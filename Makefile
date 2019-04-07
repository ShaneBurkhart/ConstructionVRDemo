.PHONY: db
NAME=construction-vr-demo
IMAGE_TAG=shaneburkhart/${NAME}

all: run

run:
	docker-compose -p ${NAME} up -d

build:
	 docker build -t ${IMAGE_TAG} -f Dockerfile .

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

prod:
	git checkout master
	git pull origin master
	$(MAKE) build
	$(MAKE) db
	$(MAKE) run

deploy_prod:
	ssh -A ubuntu@construction-vr.shaneburkhart.com "cd ~/ConstructionVRDemo; make prod;"

