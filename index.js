/*
 *  Copyright © 2016, Alethea Rose.
 *
 *  gulp-localize-html is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
