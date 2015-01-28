
ARGS=-t [ reactify --es6 --everything --visitors jstransform/visitors/es6-destructuring-visitors ]

MODS=' react react/addons codemirror majax marked moment async ansi-to-html eventemitter3 highlight.js codemirror/mode/javascript/javascript codemirror/mode/python/python codemirror/mode/clojure/clojure codemirror/mode/julia/julia codemirror/mode/rust/rust codemirror/addon/edit/closebrackets codemirror/addon/edit/matchbrackets codemirror/addon/hint/javascript-hint codemirror/addon/hint/show-hint'

# TREEDS=' treed/rx treed/rx/views/tree treed/rx/pl/ixdb treed/rx/pl/queuedb'

all: js css

pages:
	rsync www/* pages/demo -rLu
	lessc -x run.less pages/demo/build.css
	browserify ${ARGS} -d run.js | uglifyjs --screw-ie8 > pages/demo/build.js

vendorlib:
	browserify `echo ${MODS} | sed -e 's/ / -r /g'` -o www/vendor.js

# treed:
	# browserify -d `echo ${TREEDS} | sed -e 's/ / -r /g'` -o www/treed.js

view-js:
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d view.js -o www/viewer/build.js

watch-view:
	watchify `echo ${MODS} | sed -e 's/ / -x /g'` -v ${ARGS} -d view.js -o www/viewer/build.js

js:
	browserify `echo ${MODS} | sed -e 's/ / -x /g'` ${ARGS} -d run.js -o www/build.js

slow:
	browserify ${ARGS} -d run.js -o www/build.js

watch:
	watchify `echo ${MODS} | sed -e 's/ / -x /g'` -v ${ARGS} -d run.js -o www/build.js

css:
	lessc run.less www/build.css

start-ijulia:
	ipython notebook --NotebookApp.allow_origin='*' --profile=julia

start-ipython:
	ipython notebook --NotebookApp.allow_origin='*'

dumb-server:
	cd www; python -mSimpleHTTPServer

vendor: www/vendor/d3.js www/vendor/vega.js www/vendor/font-awesome-4.3.0

www/vendor/font-awesome-4.3.0:
	cd www/vendor && \
	  wget http://fontawesome.io/assets/font-awesome-4.3.0.zip &&\
	  unzip font-awesome-4.3.0.zip &&\
	  rm font-awesome-4.3.0.zip

www/vendor/d3.js:
	wget http://trifacta.github.io/vega/lib/d3.v3.min.js -O www/vendor/d3.js

www/vendor/vega.js:
	wget http://trifacta.github.io/vega/vega.js -O www/vendor/vega.js

launch-chrome:
	google-chrome --load-and-launch-app=`pwd`/chromeapp

.PHONY: css watch js all start-ipython pages vendor vendorlib
