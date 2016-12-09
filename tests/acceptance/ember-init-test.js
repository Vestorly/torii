import startApp from '../helpers/start-app';
import configuration from '../../config/environment';
import lookup from '../helpers/lookup';
import QUnit from 'qunit';

const { module, test } = QUnit;

function lookupFactory(app, key) {
  return app.__container__.lookupFactory(key);
}

let toriiConfiguration = configuration.torii;
var app, originalSessionServiceName;

module('Ember Initialization - Acceptance', {
  setup: function(){
    originalSessionServiceName = toriiConfiguration.sessionServiceName;
    delete toriiConfiguration.sessionServiceName;
  },

  teardown: function(){
    Ember.run(app, 'destroy');
    toriiConfiguration.sessionServiceName = originalSessionServiceName;
  }
});

test('session is not injected by default', function(assert){
  app = startApp();
  assert.ok(!lookup(app, 'service:session'));

  app.register('controller:application', Ember.Controller.extend());
  var controller = lookup(app, 'controller:application');
  assert.ok(!controller.get('session'), 'controller has no session');
});

test('session is injected with the name in the configuration', function(assert){
  toriiConfiguration.sessionServiceName = 'wackySessionName';

  app = startApp({loadInitializers: true});
  assert.ok(lookup(app, 'service:wackySessionName'), 'service:wackySessionName is injected');

  app.register('controller:application', Ember.Controller.extend());
  var controller = lookup(app, 'controller:application');

  assert.ok(controller.get('wackySessionName'),
     'Controller has session with accurate name');

  assert.ok(!controller.get('session'),
     'Controller does not have "session" property name');
});

test('session is injectable using inject.service', function(assert){
  toriiConfiguration.sessionServiceName = 'session';

  app = startApp({loadInitializers: true});
  assert.ok(lookup(app, 'service:session'), 'service:session is injected');

  app.register('component:testComponent', Ember.Component.extend({
    session: Ember.inject.service('session'),
    torii: Ember.inject.service('torii')
  }));

  var renderer = lookupFactory(app, 'renderer:-inert');
  var component = lookupFactory(app, 'component:testComponent').create({ renderer: renderer });

  assert.ok(component.get('session'), 'Component has access to injected session service');
  assert.ok(component.get('torii'), 'Component has access to injected torii service');
});
