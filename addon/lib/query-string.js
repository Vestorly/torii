const camelize = Ember.String.camelize;

function buildQueryString(objGetter, requiredParams, optionalParams, overriddenParams = {}) {
  const urlParams = Ember.A(requiredParams.slice()).uniq();

  const optionalUrlParams = Ember
    .A(optionalParams ? optionalParams.slice() : [])
    .uniq();

  optionalUrlParams.forEach((param) => {
    if (urlParams.indexOf(param) > -1) {
      throw new Error(
        `Required parameters cannot also be optional: "${param}"`
      );
    }
  });

  const keyValuePairs = Ember.A([]);

  const overriddenParamGetter = (keyName) => {
    return overriddenParams[keyName];
  };

  urlParams.forEach(function(paramName) {
    const paramValue = getOptionalParamValue(overriddenParamGetter, paramName) ||
      getParamValue(objGetter, paramName);

    keyValuePairs.push([paramName, paramValue]);
  });

  optionalUrlParams.forEach(function(paramName) {
    const paramValue = getOptionalParamValue(overriddenParamGetter, paramName) ||
      getOptionalParamValue(objGetter, paramName);

    if (isValue(paramValue)) {
      keyValuePairs.push([paramName, paramValue]);
    }
  });

  return keyValuePairs.map(function(pair) {
    return pair.join('=');
  }).join('&');
}

function isValue(value){
  return (value || value === false);
}

function getParamValue(objGetter, paramName, optional = false) {
  const camelizedName = camelize(paramName),
        value         = objGetter(camelizedName);

  if (!optional) {
    if ( !isValue(value) && isValue(objGetter(paramName))) {
      throw new Error(
        `Use camelized versions of url params. (Did not find \
        "${camelizedName}" property but did find \
        "${paramName}".`
      );
    }

    if (!isValue(value)) {
      throw new Error(
        `Missing url param: "${paramName}". (Looked for: property named \
        "${camelizedName}".`
      );
    }
  }

  return isValue(value) ? encodeURIComponent(value) : undefined;
}

function getOptionalParamValue(objGetter, paramName){
  return getParamValue(objGetter, paramName, true);
}

function parseQueryString(url, keys) {
  const data = {};

  keys.forEach((key) => {
    const regex = new RegExp(`${key}=([^&#]*)`);
    const match = regex.exec(url);

    if (match) {
      data[key] = match[1];
    }
  });

  return data;
}

export {
  buildQueryString,
  parseQueryString
};
