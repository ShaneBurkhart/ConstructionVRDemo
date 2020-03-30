.PHONY: db
NAME=construction-vr-demo
IMAGE_TAG=shaneburkhart/${NAME}

all: run

build:
	docker build -t ${IMAGE_TAG} -f Dockerfile .

run:
	docker-compose -f docker-compose.dev.yml -p ${NAME} up -d

c:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web /bin/bash

db_models:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web irb -r ./models/db_models.rb

clean:
	docker-compose -f docker-compose.dev.yml -p ${NAME} down || true
	docker-compose -f docker-compose.dev.yml -p ${NAME} rm -f || true

ps:
	docker-compose -f docker-compose.dev.yml -p ${NAME} ps

logs:
	docker-compose -f docker-compose.dev.yml -p ${NAME} logs -f

rerun_photos:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web_prod /app/scripts/rerun-photos.rb

########### PROD #################
prod_clean:
	docker-compose -f docker-compose.yml -p ${NAME} down || true
	docker-compose -f docker-compose.yml -p ${NAME} rm -f || true

prod_run:
	docker-compose -f docker-compose.yml -p ${NAME} up -d

prod_db:
	docker-compose -f docker-compose.yml -p ${NAME} run --rm web_prod rake db:migrate

prod:
	git checkout master
	git pull origin master
	$(MAKE) build
	$(MAKE) prod_clean
	$(MAKE) prod_run
	$(MAKE) prod_db
	$(MAKE) prod_run

deploy_prod:
	ssh -A ubuntu@construction-vr.shaneburkhart.com "cd ~/ConstructionVRDemo; make prod;"

