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

db:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web npx sequelize-cli db:migrate

rebuild_db:
	$(MAKE) clean
	rm -rf data/pg
	$(MAKE) run
	sleep 90
	$(MAKE) db


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
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web /app/scripts/rerun-photos.rb

#generate_migration:
	#npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string

########### PROD #################
prod_clean:
	docker-compose -f docker-compose.yml -p ${NAME} down || true
	docker-compose -f docker-compose.yml -p ${NAME} rm -f || true

prod_run:
	docker-compose -f docker-compose.yml -p ${NAME} up -d

prod_db:
	docker-compose -f docker-compose.yml -p ${NAME} run --rm web npx sequelize-cli db:migrate

prod:
	#git checkout master
	#git pull origin master
	$(MAKE) build
	$(MAKE) prod_clean
	$(MAKE) prod_run
	$(MAKE) prod_db
	$(MAKE) prod_run

deploy_prod:
	ssh -A ubuntu@construction-vr.shaneburkhart.com "cd ~/ConstructionVRDemo; make prod;"

