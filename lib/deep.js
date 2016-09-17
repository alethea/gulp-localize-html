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

function isObject(object) {
  return (object !== null && typeof object === 'object');
}

module.exports.access = function access(object, key, sep) {
  if (!key) { return object; }
  if (!isObject(object)) { return null; }

  var index = key.indexOf(sep);

  if (index > 0) {
    return access(object[key.slice(0, index)], key.slice(index + 1), sep);
  } else {
    return object[key];
  }
};

module.exports.extend = function extend(target, source) {
  Object.keys(source).forEach((key) => {
    if (isObject(source[key])) {
      if (!isObject(target[key])) { target[key] = {}; }
      extend(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });
};

module.exports.unflatten = function unflatten(object, sep) {
  if (!isObject(object)) { return object; }

  var result = {};

  Object.keys(object).forEach((key) => {
    var index = key.indexOf(sep);

    if (index > 0) {
      var firstKey = key.slice(0, index);
      var source = {};
      if (!isObject(result[firstKey])) { result[firstKey] = {}; }

      source[key.slice(index + 1)] = unflatten(object[key], sep);
      Object.assign(result[firstKey], source);
    } else {
      result[key] = unflatten(object[key], sep);
    }
  });

  return result;
};
