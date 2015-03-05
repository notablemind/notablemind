
ARGS=-t [ babelify --experimental ] -t envify

MODS=' react react/addons less majax marked moment async ansi-to-html eventemitter3 highlight.js \
babel \
codemirror \
codemirror/mode/javascript/javascript \
codemirror/mode/python/python \
codemirror/mode/clojure/clojure \
codemirror/mode/julia/julia \
codemirror/mode/css/css \
codemirror/mode/rust/rust \
codemirror/addon/fold/foldcode \
codemirror/addon/fold/foldgutter \
codemirror/addon/fold/brace-fold \
codemirror/addon/fold/xml-fold \
codemirror/addon/fold/comment-fold \
codemirror/addon/edit/closebrackets \
codemirror/addon/edit/matchbrackets \
codemirror/addon/hint/javascript-hint \
codemirror/addon/hint/show-hint'

ENVBLS=GITHUB_CLIENT_ID=a15ba5cf761a832d0b25 GDRIVE_CLIENT_ID=956621131838-be892j0qs2mpil992t8srhp74ijm0ski.apps.googleusercontent.com

all: node_modules vendor vendorlib js css

node_modules:
	npm install

# old stuff

view-js:
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d view.js -o www/viewer/build.js

watch-view:
	watchify `echo ${MODS} | sed -e 's/ / -x /g'` -v ${ARGS} -d view.js -o www/viewer/build.js


# main assets

disk-bundle:
	env ${ENVBLS} browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} --full-paths -d run.js -o disk.js

js:
	env ${ENVBLS} browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d run.js -o www/build.js

watch:
	env ${ENVBLS} watchify `echo ${MODS} | sed -e 's/ / -x /g'` -v ${ARGS} -d run.js -o www/build.js

css:
	lessc --source-map --source-map-basepath=www/ run.less www/build.css

vendorlib:
	browserify `echo ${MODS} | sed -e 's/ / -r /g'` -o www/vendor.js


# js files for baked docs

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

pages:
	rsync www/* pages/ -rLu
	lessc -x run.less pages/build.css
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d run.js | uglifyjs --screw-ie8 > pages/build.js
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d bin/client.js | uglifyjs --screw-ie8 > pages/baked.js

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
	  wget http://fontawesome.io/assets/font-awesome-4.3.0.zip &&\
	  unzip font-awesome-4.3.0.zip &&\
	  rm font-awesome-4.3.0.zip

www/vendor/d3.js:
	mkdir -p www/vendor
	wget http://trifacta.github.io/vega/lib/d3.v3.min.js -O www/vendor/d3.js

www/vendor/vega.js:
	mkdir -p www/vendor
	wget http://trifacta.github.io/vega/vega.js -O www/vendor/vega.js

launch-chrome:
	google-chrome --load-and-launch-app=`pwd`/chromeapp

.PHONY: css watch js all start-ipython pages vendor vendorlib
