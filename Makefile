.PHONY: db
NAME=construction-vr-demo
IMAGE_TAG=shaneburkhart/${NAME}

all: run

build:
	docker build -t ${IMAGE_TAG}-web -f packages/web/Dockerfile ./packages/web
	docker build -t ${IMAGE_TAG}-lambda -f packages/lambda/Dockerfile ./packages/lambda
	docker build -t ${IMAGE_TAG}-lambda-queue -f packages/lambda-queue/Dockerfile ./packages/lambda-queue

run:
	docker-compose -f docker-compose.dev.yml -p ${NAME} up -d

c:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web /bin/bash

c_node:
	docker-compose -f docker-compose.yml -p ${NAME} run --rm web node -i -e "const models = require('./models/index.js')"

build_js:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm websocket npm run-script build

npm_install:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm websocket npm install
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm lambda_queue_processor npm install

clean_npm_install:
	rm -rf packages/web/node_modules
	rm -rf packages/web/package-lock.json
	rm -rf ./packages/lambda-queue/node_modules
	rm -rf ./packages/lambda-queue/package-lock.json
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm websocket npm install
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm lambda_queue_processor npm install

db:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web npx sequelize-cli db:migrate

db_seed:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm web npx sequelize-cli db:seed:all --seeders-path seeders

wipe:
	$(MAKE) clean
	rm -rf data/pg
	$(MAKE) db || echo "\n\nDatabase needs a minute to start...\nWaiting 30 seconds for Postgres to start...\n\n"
	sleep 30
	$(MAKE) db

pg:
	echo "Enter 'postgres'..."
	docker-compose -f docker-compose.dev.yml  -p ${NAME} run --rm pg psql -h pg -d mydb -U postgres --password

pg_dump:
	#docker exec <pg_container_id> pg_dump -Fc -v -f /app/full.dump -U postgres mydb

pg_restore:
	#docker exec <pg_container_id> pg_restore -a --disable-triggers -U postgres -d mydb -Fc /app/full.dump

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
prod_c:
	docker-compose -f docker-compose.yml -p ${NAME} run --rm web /bin/bash

prod_c_node:
	docker-compose -f docker-compose.yml -p ${NAME} run --rm web node -i -e "const models = require('./models/index.js')"

prod_clean:
	docker-compose -f docker-compose.yml -p ${NAME} down || true
	docker-compose -f docker-compose.yml -p ${NAME} rm -f || true

prod_run:
	docker-compose -f docker-compose.yml -p ${NAME} up -d

prod_db:
	docker-compose -f docker-compose.yml -p ${NAME} run --rm web npx sequelize-cli db:migrate

prod:
	git checkout master
	git pull origin master
	$(MAKE) build
	$(MAKE) prod_clean
	$(MAKE) prod_run
	$(MAKE) prod_db
	$(MAKE) prod_run

deploy_prod:
	ssh -A ubuntu@construction-vr.shaneburkhart.com "cd ~/ConstructionVRDemo-Prod; make prod;"

