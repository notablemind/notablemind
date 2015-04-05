"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var fs = _interopRequire(require("fs"));

var browserify = _interopRequire(require("browserify"));

var watchify = _interopRequire(require("watchify"));

var external = _interopRequire(require("../external"));

var path = _interopRequire(require("path"));

var entry = {
  id: path.resolve("./hello.js"),
  file: path.resolve("./hello.js"),
  source: "\n    console.log(\"hello\")\n    import inject from './injected.js'\n  ",
  entry: true };

var injected = {
  id: path.resolve("./injected.js"),
  file: path.resolve("./injected.js"),
  source: "console.log(\"I inject you\")",
  entry: false,
  external: false };

var outfile = "./tst.js";

var b = browserify({
  cache: {},
  packageCache: {},
  debug: true });

b.external(external);
b.transform("babelify", { experimental: true });
b.transform("envify");
b.add(entry);
b.add(injected);

/*
const w = watchify(b)
console.log('initial')
w.on('update', () => {
  console.log('updating')
  w.bundle((err, buf) => {
    console.log('done updating')
    fs.writeFileSync(outfile, buf)
  })
})
.on('log', log => {
  console.log('Watchify:', log)
})
*/

b.bundle(function (err, buf) {
  if (err) {
    console.log("ERROR", err);
    return;
  }
  console.log("done initial");
  fs.writeFileSync(outfile, buf);
});

