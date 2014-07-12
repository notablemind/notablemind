
all: mains css

mains:
	browserify -d -t reactify ../index.js -s Notablemind -o bundle/bundle.js && echo "Done"

watch:
	watchify -v -d -t reactify ../index.js -s Notablemind -o bundle/bundle.js && echo "Done"

dev:
	browserify -d -t reactify -t fusionify ../lib/index.jsx -o bundle/dev.js

tree:
	modtree ../lib/index.jsx bundle/tree.js -p fusion.modtree && echo "Done"

css:
	atomify -c [ ../index.less -o bundle/bundle.css ]

less: index.css
	@echo -n

jss := $(wildcard ../../lib/*.js)

build-test: bundle-test.js
	@echo -n

bundle-test.js: ${jss} index.js test-setup.js
	browserify test-setup.js -r reactify --debug > bundle-test.js && echo "Done"


.PHONY: css mains tree dev
