
ARGS=-t [ babelify --experimental ] -t envify

MODS=' react react/addons less/lib/less majax marked async ansi-to-html eventemitter3 highlight.js \
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

X_MODS=`echo ${MODS} | sed -e 's/ / -x /g'`

BROW=env ${ENVBLS} browserify ${X_MODS} ${ARGS} -d

WAT=env ${ENVBLS} watchify ${X_MODS} -v ${ARGS} -d

