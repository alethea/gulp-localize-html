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
