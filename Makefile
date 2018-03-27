IMAGE_TAG=shaneburkhart/construction-vr-demo
NAME=construction-vr-demo

all: run

run:
	docker run -d --rm --name ${NAME} -p 4567:4567 --env-file user.env ${IMAGE_TAG}

build:
	 docker build -t ${IMAGE_TAG} -f Dockerfile .

c_image:
	docker run --rm -v $(shell pwd)/input:/app -v $(shell pwd)/output:/output -it ${IMAGE_TAG} /bin/bash

shrink_png:
	pngnq -n 256 image.png && pngcrush image-nq8.png smallimage.png

clean:
	docker stop ${NAME} || true
	docker rm ${NAME} || true
