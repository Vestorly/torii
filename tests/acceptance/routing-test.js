import startApp from '../helpers/start-app';
import rawConfig from '../../config/environment';
import lookup from '../helpers/lookup';
import Router from 'dummy/router';
import QUnit from 'qunit';
import Ember from 'ember';

let { module, test } = QUnit;

let configuration = rawConfig.torii;
var app, originalSessionServiceName;

module('Acceptance | Routing', {
  beforeEach() {
    originalSessionServiceName = configuration.sessionServiceName;
    delete configuration.sessionServiceName;
  },

  afterEach() {
    configuration.sessionServiceName = originalSessionServiceName;
    Ember.run(app, 'destroy');
  }
});

test('ApplicationRoute#checkLogin is not called when no authenticated routes are present', function(assert){
  assert.expect(2);
  configuration.sessionServiceName = 'session';

  var routesConfigured = false;
  var checkLoginCalled = false;

  bootApp({
    map: function _map() {
      routesConfigured = true;
    },
    setup: function() {
      app.register('route:application', Ember.Route.extend());
    }
  });
  var applicationRoute = lookup(app, 'route:application');
  applicationRoute.reopen({
    checkLogin: function() {
      checkLoginCalled = true;
    }
  });
  applicationRoute.beforeModel();
  assert.ok(routesConfigured, 'Router map was called');
  assert.ok(!checkLoginCalled, 'checkLogin was not called');
});

test('ApplicationRoute#checkLogin is called when an authenticated route is present', function(assert){
  assert.expect(2);
  configuration.sessionServiceName = 'session';

  var routesConfigured = false;
  var checkLoginCalled = false;

  bootApp({
    map: function() {
      routesConfigured = true;
      this.authenticatedRoute('account');
    },
    setup: function() {
      app.register('route:application', Ember.Route.extend());
      app.register('route:account', Ember.Route.extend());
    }
  });
  var applicationRoute = lookup(app, 'route:application');
  applicationRoute.reopen({
    checkLogin: function() {
      checkLoginCalled = true;
    }
  });
  var router = lookup(app, 'router:main');
  router.location.setURL('/');
  applicationRoute.beforeModel();
  assert.ok(routesConfigured, 'Router map was called');
  assert.ok(checkLoginCalled, 'checkLogin was called');
});

test('ApplicationRoute#checkLogin returns the correct name of the session variable when an authenticated route is present', function(assert){
  assert.expect(2);
  configuration.sessionServiceName = 'testName';
  var routesConfigured = false,
    sessionFound = false;

  bootApp({
    map: function() {
      routesConfigured = true;
      this.authenticatedRoute('account');
    },
    setup: function() {
      app.register('route:application', Ember.Route.extend());
      app.register('route:account', Ember.Route.extend());
    }
  });
  var applicationRoute = lookup(app, 'route:application');
  applicationRoute.reopen({
    checkLogin: function() {
      sessionFound = this.get('testName');
    }
  });
  var router = lookup(app, 'router:main');
  router.location.setURL('/');
  applicationRoute.beforeModel();
  assert.ok(routesConfigured, 'Router map was called');
  assert.ok(sessionFound, 'session was found with custom name');

});

test('authenticated routes get authenticate method', function(assert){
  assert.expect(2);
  configuration.sessionServiceName = 'session';

  bootApp({
    map: function() {
      this.route('home');
      this.authenticatedRoute('account');
    },
    setup: function() {
      app.register('route:application', Ember.Route.extend());
      app.register('route:account', Ember.Route.extend());
      app.register('route:home', Ember.Route.extend());
    }
  });
  var authenticatedRoute = lookup(app, 'route:account');
  var unauthenticatedRoute = lookup(app, 'route:home');

  assert.ok(authenticatedRoute.authenticate, "authenticate function is present");
  assert.ok(!unauthenticatedRoute.authenticate, "authenticate function is not present");
});

test('lazily created authenticated routes get authenticate method', function(assert){
  assert.expect(2);
  configuration.sessionServiceName = 'session';

  bootApp({
    map: function() {
      this.route('home');
      this.authenticatedRoute('account');
    }
  });
  var applicationRoute = lookup(app, 'route:application');
  var authenticatedRoute = lookup(app, 'route:account');

  assert.ok(applicationRoute.checkLogin, "checkLogin function is present");
  assert.ok(authenticatedRoute.authenticate, "authenticate function is present");
});

test('session.attemptedTransition is set before redirecting away from authenticated route', function(assert){
  var done = assert.async();
  assert.expect(1);

  configuration.sessionServiceName = 'session';
  var attemptedTransition = null;

  bootApp({
    map: function() {
      this.route('public');
      this.authenticatedRoute('secret');
    },
    setup: function() {
      app.register('route:application', Ember.Route.extend());
      app.register('route:secret', Ember.Route.extend());
    }
  });

  var applicationRoute = lookup(app, 'route:application');
  applicationRoute.reopen({
    actions: {
      accessDenied: function() {
        attemptedTransition = this.get('session').attemptedTransition;
      }
    }
  });

  visit('/secret').then(function(){
    assert.ok(!!attemptedTransition, 'attemptedTransition was set');
    done();
  });
});

function bootApp(attrs) {
  var map = attrs.map || function(){};
  var setup = attrs.setup || function() {};

  var appRouter = Router.extend();

  appRouter.map(map);

  app = startApp({
    loadInitializers: true,
    Router: Router
  });

  setup();

  Ember.run(function(){
    app.advanceReadiness();
  });

  return app.boot();
}
