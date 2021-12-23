.PHONY: db
include user.env
-include prod.env

NAME=finish-vision
IMAGE_TAG=shaneburkhart/${NAME}
LAMBDA_IMAGE_TAG=${IMAGE_TAG}-lambda

C?=web

all: run

build:
	docker build -t ${IMAGE_TAG}-tailwind -f packages/tailwind/Dockerfile ./packages/tailwind
	docker build -t ${IMAGE_TAG}-lambda -f packages/lambda/Dockerfile ./packages/lambda
	docker build -t ${IMAGE_TAG}-lambda-queue -f packages/lambda-queue/Dockerfile ./packages/lambda-queue
	docker build -t ${IMAGE_TAG}-web -f packages/web/Dockerfile ./packages/web
	docker build -t ${IMAGE_TAG}-next -f packages/next/Dockerfile ./packages/next

run:
	docker-compose -f docker-compose.dev.yml -p ${NAME} up -d

restart:
	$(MAKE) clean
	$(MAKE) run
	$(MAKE) logs

c:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm ${C} /bin/bash

c_node:
	docker-compose -f docker-compose.yml -p ${NAME} run --rm web node -i -e "const models = require('./models/index.js')"

build_js:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm websocket npm run-script build

npm_install:
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm websocket npm install
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm lambda_queue_processor npm install
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm tailwind npm install

clean_npm_install:
	rm -rf packages/web/node_modules
	rm -rf packages/web/package-lock.json
	rm -rf ./packages/lambda-queue/node_modules
	rm -rf ./packages/lambda-queue/package-lock.json
	rm -rf ./packages/tailwind/node_modules
	rm -rf ./packages/tailwind/package-lock.json
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm websocket npm install
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm lambda_queue_processor npm install
	docker-compose -f docker-compose.dev.yml -p ${NAME} run --rm tailwind npm install

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
	# $(MAKE) deploy_lambda
	$(MAKE) prod_clean
	$(MAKE) prod_run
	$(MAKE) prod_db
	$(MAKE) prod_run

deploy_prod:
	ssh -A ubuntu@finish-vision.shaneburkhart.com "cd ~/ConstructionVRDemo-Prod; make prod;"


AWS_CLI=docker run -t --rm --env-file prod.env amazon/aws-cli

deploy_lambda:
	docker build -t ${LAMBDA_IMAGE_TAG} -f packages/lambda/Dockerfile ./packages/lambda

	$(AWS_CLI) ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ECR_ADDRESS}
	$(AWS_CLI) ecr describe-repositories --repository-names ${AWS_ECR_REPO_NAME} || \
		$(AWS_CLI) ecr create-repository --repository-name ${AWS_ECR_REPO_NAME} --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE

	docker tag ${LAMBDA_IMAGE_TAG}:latest ${AWS_ECR_ADDRESS}/${AWS_ECR_REPO_NAME}:latest
	docker push ${AWS_ECR_ADDRESS}/${AWS_ECR_REPO_NAME}:latest

	$(AWS_CLI) lambda get-function --function-name ${AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME} || \
		$(AWS_CLI) lambda create-function \
				--function-name ${AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME} \
				--role ${AWS_LAMBDA_EXECUTION_ROLE} \
				--code ImageUri=${AWS_ECR_ADDRESS}/${AWS_ECR_REPO_NAME}:latest \
				--package-type Image \
				--image-config Command=split_pdf.split

	$(AWS_CLI) lambda update-function-configuration \
				--function-name ${AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME} \
				--image-config Command=split_pdf.split \
				--memory-size 512 \
				--timeout 180 \
				--environment Variables={SITE_URL=${SITE_URL},AWS_BUCKET=${AWS_BUCKET},NODE_ENV=${NODE_ENV},AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME=FinishVisionsplitPDF,AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME=FinishVisionpdfToImage,AWS_CROP_IMAGE_LAMBDA_FUNCTION_NAME=FinishVisioncropImage,AWS_IMAGE_TEXT_RECOGNITION_LAMBDA_FUNCTION_NAME=FinishVisionimageTextRecognition}
	$(AWS_CLI) lambda update-function-code \
				--function-name ${AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME} \
				--image-uri ${AWS_ECR_ADDRESS}/${AWS_ECR_REPO_NAME}:latest 

	$(AWS_CLI) lambda get-function --function-name ${AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME} || \
		$(AWS_CLI) lambda create-function \
				--function-name ${AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME} \
				--role ${AWS_LAMBDA_EXECUTION_ROLE} \
				--code ImageUri=${AWS_ECR_ADDRESS}/${AWS_ECR_REPO_NAME}:latest \
				--package-type Image \
				--image-config Command=pdf_to_image.to_image

	$(AWS_CLI) lambda update-function-configuration \
				--function-name ${AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME} \
				--image-config Command=pdf_to_image.to_image \
				--memory-size 512 \
				--timeout 180 \
				--environment Variables={SITE_URL=${SITE_URL},AWS_BUCKET=${AWS_BUCKET},NODE_ENV=${NODE_ENV},AWS_SPLIT_PDF_LAMBDA_FUNCTION_NAME=FinishVisionsplitPDF,AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME=FinishVisionpdfToImage,AWS_CROP_IMAGE_LAMBDA_FUNCTION_NAME=FinishVisioncropImage,AWS_IMAGE_TEXT_RECOGNITION_LAMBDA_FUNCTION_NAME=FinishVisionimageTextRecognition}
	$(AWS_CLI) lambda update-function-code \
				--function-name ${AWS_PDF_TO_IMAGE_LAMBDA_FUNCTION_NAME} \
				--image-uri ${AWS_ECR_ADDRESS}/${AWS_ECR_REPO_NAME}:latest 