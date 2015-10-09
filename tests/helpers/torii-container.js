import bootstrapTorii from 'torii/bootstrap/torii';

export default function toriiContainer(callback) {
  var registry = new Ember.Registry();
  var container = registry.container();
  var mockApp = {
    register: function() {
      registry.register.apply(registry, arguments);
    },
    inject: function() {
      registry.injection.apply(registry, arguments);
    },
    hasRegistration: function() {
      return registry.has.apply(registry, arguments);
    }
  };
  if (callback) {
    callback(registry, container);
  }
  bootstrapTorii(mockApp);
  return [registry, container];
}
