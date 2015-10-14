var get = Ember.get;

const NAMESPACE = 'providers';
let configuration = {};

function configurable(configKey, defaultValue){
  return Ember.computed(function configurableComputed(){
    // Trigger super wrapping in Ember 2.1.
    // See: https://github.com/emberjs/ember.js/pull/12359
    this._super = this._super || (function(){ throw new Error('should always have _super'); })();
    var configNamespace = NAMESPACE + '.' + this.get('name');
    var propertyPath = configNamespace + '.' + configKey;
    let configuration = getConfiguration();
    var value = get(configuration, propertyPath);

    if (typeof value === 'undefined') {
      if (typeof defaultValue !== 'undefined') {
        if (typeof defaultValue === 'function') {
          return defaultValue.call(this);
        } else {
          return defaultValue;
        }
      } else {
        throw new Error("Expected configuration value "+configKey+" to be defined for provider named " + this.get("name"));
      }
    }
    return value;
  });
}

function configure(settings) {
  configuration = settings;
}

function getConfiguration() {
  return configuration;
}

export {configurable, configure, getConfiguration};

export default {};
