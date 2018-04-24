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
	docker-compose logs -f
