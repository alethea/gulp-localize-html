/*
 *  Copyright © 2016, Alethea Rose.
 *
 *  This file is part of gulp-localize-html.
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

var fs = require('fs');
var path = require('path');

var through = require('through2');
var yaml = require('js-yaml');
var vfs = require('vinyl-fs');

var deep = require('./deep');

module.exports.load = function (opt) {
  var catalog = {};

  return new Promise((resolve, reject) =>
    vfs.src(opt.pattern)
      .pipe(through.obj((file, enc, cb) => {
        var tree = {};
        var leaves = {};

        try {
          if (file.isBuffer() && /\.ya?ml$/i.test(file.extname)) {
            tree = yaml.safeLoad(file.contents, {filename: file});
          } else if (file.isBuffer() && /\.json$/i.test(file.extname)) {
            tree = JSON.parse(file.contents);
          }
        } catch (error) {
          return cb(error);
        }

        if (opt.catalogPathInKey) {
          leaves = tree;
          tree = {};
          tree[opt.pathToKey(file.relative, opt)] = leaves;
        }

        deep.extend(catalog, deep.unflatten(tree));
        cb(null, file);
      }, () => resolve(catalog)).on('error', reject))
  );
};

module.exports.lookup = function lookup(key, locale, catalog, opt) {
  if (!locale) { return key; }

  var result = deep.access(catalog, locale + opt.sep + key, opt.sep);

  if (result) {
    return result;
  } else {
    if (opt.warn) { opt.warnFunction(locale, key); }

    if (opt.fallback && typeof opt.fallback == 'object') {
      return lookup(key, opt.fallback[locale], opt);
    } else if (opt.fallback && opt.fallback != locale) {
      return lookup(key, opt.fallback, opt);
    } else {
      if (opt.error) { opt.errorFunction(locale, key); }
      return key;
    }
  }
};
