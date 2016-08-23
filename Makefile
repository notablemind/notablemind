
include ./common.mk

pages:
	rsync -r www/ pages

babel-vendor:
	browserify scripts/babelme.js -o www/vendor/babel.js -s babelme

css:
	lessc --source-map --source-map-basepath=www/ src/run.less www/build.css
# helpers

start-ijulia:
	cd .jupyter-env && ipython notebook --NotebookApp.allow_origin='*' --profile=julia

start-ipython:
	# jupyter notebook --NotebookApp.allow_origin='*' --Session.key='' --no-browser
	cd .jupyter-env && ipython notebook --NotebookApp.allow_origin='*' --Session.key='' --no-browser

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
