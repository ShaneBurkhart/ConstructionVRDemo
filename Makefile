NAME=construction-vr-demo
IMAGE_TAG=shaneburkhart/${NAME}

all: run

run:
	docker-compose -p ${NAME} up -d

build:
	 docker build -t ${IMAGE_TAG} -f Dockerfile .

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
	$(MAKE) run

deploy_prod:
	ssh -A ubuntu@construction-vr.shaneburkhart.com "cd ~/ConstructionVR; make prod;"

