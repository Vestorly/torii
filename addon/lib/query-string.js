var camelize = Ember.String.camelize,
    get      = Ember.get;

function isValue(value){
  return (value || value === false);
}

function getParamValue(obj, paramName, optional){
  var camelizedName = camelize(paramName),
      value         = get(obj, camelizedName);

  if (!optional) {
    if ( !isValue(value) && isValue(get(obj, paramName))) {
      throw new Error(
        'Use camelized versions of url params. (Did not find ' +
        '"' + camelizedName + '" property but did find ' +
        '"' + paramName + '".');
    }

    if (!isValue(value)) {
      throw new Error(
        'Missing url param: "'+paramName+'". (Looked for: property named "' +
        camelizedName + '".'
      );
    }
  }

  return isValue(value) ? encodeURIComponent(value) : undefined;
}

function getOptionalParamValue(obj, paramName){
  return getParamValue(obj, paramName, true);
}

export default Ember.Object.extend({
  init: function() {
    this.obj               = this.provider;
    this.urlParams         = Ember.A(this.requiredParams).uniq();
    this.optionalUrlParams = Ember.A(this.optionalParams || []).uniq();

    this.optionalUrlParams.forEach(function(param){
      if (this.urlParams.indexOf(param) > -1) {
        throw new Error("Required parameters cannot also be optional: '" + param + "'");
      }
    }, this);
  },

  toString: function() {
    var urlParams         = this.urlParams,
        optionalUrlParams = this.optionalUrlParams,
        obj               = this.obj,
        keyValuePairs     = Ember.A([]);

    urlParams.forEach(function(paramName){
      var paramValue = getParamValue(obj, paramName);

      keyValuePairs.push( [paramName, paramValue] );
    });

    optionalUrlParams.forEach(function(paramName){
      var paramValue = getOptionalParamValue(obj, paramName);

      if (isValue(paramValue)) {
        keyValuePairs.push( [paramName, paramValue] );
      }
    });

    return keyValuePairs.map(function(pair){
      return pair.join('=');
    }).join('&');
  }
});
