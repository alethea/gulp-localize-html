var gutil = require('gulp-util');
var through = require('through2');
var htmlparser2 = require('htmlparser2');

var callbacks = require('./lib/callbacks');
var translate = require('./lib/translate');

var PLUGIN_NAME = 'gulp-localize-html';
var DEFAULTS = {
  sep: '.',
  localeSep: ':',
  keyRegexp: /^\s*[\w-.:]+\s*$/,
  translateAttrs: ['title', 'alt', 'placeholder', 'value', 'aria-label'],
  replaceAttrs: ['src', 'srcset', 'srclang', 'hreflang', 'lang'],
  hrefTags: ['a'],
  localePlaceholder: '_locale_',
  catalogPathInKey: true,
  translatePaths: false,
  pathKey: 'path',
  warn: true,
  error: false
};

module.exports = function (pattern, options) {
  if (!options && typeof path == 'object') {
    options = pattern;
    pattern = options.pattern;
  }


  var opt = Object.assign(
    {pattern: pattern}, DEFAULTS, callbacks(PLUGIN_NAME), options);

  return through.obj(function (file, enc, cb) {
    var push = (file => this.push(file));

    try {
      file._localizeDOM = htmlparser2.parseDOM(file.contents);
    } catch (err) {
      return cb(new gutil.PluginError(PLUGIN_NAME, err));
    }

    opt.splitFile(file, opt).then(files =>
      Promise.all(files.map(file => translate(opt, file).then(push)))
    ).then(() => cb(), err => cb(new gutil.PluginError(PLUGIN_NAME, err)));
  });
};

module.exports.defaults = DEFAULTS;
