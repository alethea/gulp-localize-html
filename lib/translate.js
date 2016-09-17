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

var htmlparser2 = require('htmlparser2');
var DomUtils = htmlparser2.DomUtils;
var ElementType = htmlparser2.ElementType;

function translateText(elem, opt, file) {
  var children = DomUtils.getChildren(elem) || [];
  var child = children[0];

  if (children.length == 1 &&
      child.type == ElementType.Text &&
      opt.keyRegexp.test(child.data)) {

    var ctx = {file: file, element: elem};
    return opt.translate(child.data.trim(), file.locale, ctx, opt)
      .then((translation) => { child.data = translation; });
  } else {
    return Promise.resolve(null);
  }
}

function translateAttr(elem, opt, file) {
  var attrs = elem.attribs || {};

  return Promise.all(Object.keys(attrs).map(attr => {
    var value = DomUtils.getAttributeValue(elem, attr);
    var ctx = {element: elem, attribute: attr, file: file};
    var done = (data => { elem.attribs[attr] = data; });

    if (value && opt.translateAttrs.indexOf(attr) >= 0 &&
        opt.keyRegexp.test(value)) {
      return opt.translate(value.trim(), file.locale, ctx, opt).then(done);
    } else if (value && opt.replaceAttrs.indexOf(attr) >= 0) {
      return opt.replaceAttribute(value, file.locale, ctx, opt).then(done);
    } else {
      return Promise.resolve(null);
    }
  }));
}

function translateHref (elem, opt, file) {
  var href = DomUtils.getAttributeValue(elem, 'href');
  var ctx = {file: file, element: elem};

  if (href && opt.hrefTags.indexOf(DomUtils.getName(elem)) >= 0) {
    return opt.translateHref(href.trim(), file.locale, ctx, opt)
      .then(data => { elem.attribs.href = data; });
  } else {
    return Promise.resolve(null);
  }
}

module.exports = function(opt, file) {
  var dom = file._localizeDOM || htmlparser2.parseDOM(file.contents);

  var elems = DomUtils.findAll(
    (elem => DomUtils.getAttributeValue(elem, 'translate') != 'no'), dom);

  return Promise.all(elems.map(elem => 
    Promise.all([
      translateText(elem, opt, file),
      translateHref(elem, opt, file),
      translateAttr(elem, opt, file)
    ])
  )).then(() => {
      file.contents = new Buffer(DomUtils.getOuterHTML(dom));
      delete file._localizeDOM;
      delete file._localizeSource;
      return file;
    });
};
