var path = require('path');
var gutil = require('gulp-util');
var storage = require('./storage');

module.exports = function (PLUGIN_NAME) {
  var catalogPromise = null;
  var callbacks = {};

  callbacks.loadCatalog = function (opt) {
    if (!catalogPromise) { catalogPromise = storage.load(opt); }
    return catalogPromise;
  };

  callbacks.getLocales = function (opt) {
    if (opt.locales) { return Promise.resolve(opt.locales); }
    return opt.loadCatalog(opt).then(catalog => Object.keys(catalog));
  };

  callbacks.splitFile = function (file, opt) {
    file._localizeSource = file.relative;
    if (file.locale) {
      return Promise.resolve([file]);
    } else {
      return opt.getLocales(opt)
        .then(locales => Promise.all(locales.map(locale =>
          opt.computePath(file.relative, locale, {file: file}, opt)
            .then(filename => {
              var clone = file.clone({deep: true, contents: false});
              clone.path = path.join(file.base, filename);
              clone.locale = locale;
              return clone;
            })
        )));
    }
  };

  callbacks.computePath = function (filename, locale, context, opt) {
    return opt.router(filename, locale, context, opt).
      then(route => gutil.replaceExtension(
        route.replace('/', path.sep), path.extname(filename)
      ));
  };

  callbacks.translate = function (key, locale, context, opt) {
    var file = context.file;

    var localeSep = key.indexOf(opt.localeSep);

    if (localeSep > 0) {
      locale = key.slice(0, localeSep);
      key = key.slice(localeSep + 1);
    }
    
    if (file && key.indexOf(opt.sep) === 0) {
      key = opt.pathToKey(file._localizeSource, opt) + key;
    }

    return opt.loadCatalog(opt)
      .then(catalog => storage.lookup(key, locale, catalog, opt));
  };

  callbacks.translateHref = function (href, locale, context, opt) {
    return opt.router(href, locale, context, opt)
      .then(route => {
        route = route.replace(path.sep, '/');
        return /^\//.test(href) ? '/' + route : route;
      });
  };

  callbacks.replaceAttribute = function (src, locale, context, opt) {
    return Promise.resolve(src.replace(opt.localePlaceholder, locale, opt));
  };

  callbacks.warnFunction = function (locale, key, opt) {
    key = gutil.colors.blue(key);
    locale = gutil.colors.yellow(locale);
    gutil.log(PLUGIN_NAME +
      ': Missing translation "' + key + '" in locale "' + locale + '"');
  };

  callbacks.errorFunction = function (locale, key, opt) {
    throw 'Missing translation "' + key + '" in locale "' + locale + '"';
  };

  callbacks.pathToKey = function(pathname, opt) {
    var components = path.parse(pathname);
    return path.join(components.dir, components.name)
      .split(path.sep)
      .join(opt.sep);
  };

  callbacks.router = function(pathname, locale, context, opt) {
    if (opt.translatePaths) {
      var key = [opt.pathToKey(pathname, opt), opt.pathKey].join(opt.sep);
      return opt.translate(key, locale, context, opt);
    } else {
      if (pathname.indexOf(locale + path.sep) === 0) {
        return Promise.resolve(pathname);
      } else {
        return Promise.resolve(path.join(locale, pathname));
      }
    }
  };

  return callbacks;
};
