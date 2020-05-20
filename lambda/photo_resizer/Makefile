all: zip

build:
	rm -rf node_modules
	docker run --rm -w /app -v $(shell pwd):/app node:10 npm install

zip:
	zip -r photo-thumbnail-generator.zip * -x Makefile
