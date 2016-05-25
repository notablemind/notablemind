
include ./common.mk

all: node_modules vendor vendorlib js css

globs:
	which babel-node || npm install -g babel
	babel --version
	which browserify || npm install -g browserify
	browserify --version
	which lessc || npm install -g less
	lessc --version
	which slimerjs || npm install -g slimerjs
	slimerjs --version

test: globs node_modules vendor www/vendor.js css test/build/components/doc-viewer.js
	babel-node test/test.js

test/build/components/doc-viewer.js:
	babel-node test/once.js

node_modules:
	npm install || npm install

# old stuff

view-js:
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d view.js -o www/viewer/build.js

watch-view:
	watchify `echo ${MODS} | sed -e 's/ / -x /g'` -v ${ARGS} -d view.js -o www/viewer/build.js


# main assets

disk-bundle:
	env ${ENVBLS} browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} --full-paths -d run.js -o disk.js

www/build.js:
	env ${ENVBLS} browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d run.js -o www/build.js

js: www/build.js

watch:
	env ${ENVBLS} watchify `echo ${MODS} | sed -e 's/ / -x /g'` -v ${ARGS} -d run.js -o www/build.js

css:
	lessc --source-map --source-map-basepath=www/ run.less www/build.css

vendorlib: www/vendor.js

www/vendor.js:
	browserify `echo ${MODS} | sed -e 's/ / -r /g'` -o www/vendor.js


# js files for baked docs

bakedlib:
	browserify `echo ${MODS} | sed -e 's/ / -r /g'` -o www/baked-vendor.js

baked:
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d bin/client.js -o www/baked.js

watch-baked:
	watchify `echo ${MODS} | sed -e 's/ / -x /g'` -v ${ARGS} -d bin/client.js -o www/baked.js


# docs

ipython:
	mkdir -p www/tutorial/ipython
	./bin/bake.js -i pages/src/ipython.nm -o www/tutorial/ipython/index.html -r ../../

tutorial:
	mkdir -p www/tutorial
	./bin/bake.js -i pages/src/tutorial.nm -o www/tutorial/index.html -r ../


# github pages things

pages: sync-pages
	lessc -x run.less pages/build.css
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d run.js | uglifyjs --screw-ie8 > pages/build.js
	# browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d bin/client.js | uglifyjs --screw-ie8 > pages/baked.js

sync-pages:
	rsync www/* pages/ -rLu

gh-pages:
	cd pages && git add . && git commit -am"update" && git push



# helpers

start-ijulia:
	ipython notebook --NotebookApp.allow_origin='*' --profile=julia

start-ipython:
	ipython notebook --NotebookApp.allow_origin='*'

serve:
	cd www; python -mSimpleHTTPServer 6682

vendor: www/vendor/d3.js www/vendor/vega.js www/vendor/font-awesome-4.3.0

www/vendor/font-awesome-4.3.0:
	mkdir -p www/vendor
	cd www/vendor && \
	  wget https://github.com/FortAwesome/Font-Awesome/archive/v4.3.0.zip && \
	  unzip v4.3.0.zip &&\
	  rm v4.3.0.zip &&\
	  mv Font-Awesome-4.3.0 font-awesome-4.3.0

www/vendor/d3.js:
	mkdir -p www/vendor
	wget http://trifacta.github.io/vega/lib/d3.v3.min.js -O www/vendor/d3.js

www/vendor/vega.js:
	mkdir -p www/vendor
	wget http://trifacta.github.io/vega/vega.js -O www/vendor/vega.js

launch-chrome:
	google-chrome --load-and-launch-app=`pwd`/chromeapp

.PHONY: css watch js all start-ipython pages vendor vendorlib sync-pages ipython tutorial
