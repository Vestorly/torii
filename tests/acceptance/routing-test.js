import Route from '@ember/routing/route';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';

import Router from 'dummy/router';
import startApp from '../helpers/start-app';
import rawConfig from '../../config/environment';
import lookup from '../helpers/lookup';

module('Acceptance | Routing', function(hooks) {
  let configuration = rawConfig.torii;
  let app, originalSessionServiceName;

  hooks.beforeEach(function() {
    originalSessionServiceName = configuration.sessionServiceName;
    delete configuration.sessionServiceName;
  });

  hooks.afterEach(function() {
    configuration.sessionServiceName = originalSessionServiceName;
    run(app, 'destroy');
  });

  test('ApplicationRoute#checkLogin is not called when no authenticated routes are present', function(assert){
    assert.expect(2);

    let routesConfigured = false;
    let checkLoginCalled = false;

    configuration.sessionServiceName = 'session';

    bootApp({
      map() {
        routesConfigured = true;
      },
      setup() {
        app.register('route:application', Route.extend());
      }
    });

    const applicationRoute = lookup(app, 'route:application');
    applicationRoute.reopen({
      checkLogin() {
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
      map() {
        routesConfigured = true;
        this.authenticatedRoute('account');
      },
      setup() {
        app.register('route:application', Route.extend());
        app.register('route:account', Route.extend());
      }
    });
    var applicationRoute = lookup(app, 'route:application');
    applicationRoute.reopen({
      checkLogin() {
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
      map() {
        routesConfigured = true;
        this.authenticatedRoute('account');
      },
      setup() {
        app.register('route:application', Route.extend());
        app.register('route:account', Route.extend());
      }
    });
    var applicationRoute = lookup(app, 'route:application');
    applicationRoute.reopen({
      checkLogin() {
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
      map() {
        this.route('home');
        this.authenticatedRoute('account');
      },
      setup() {
        app.register('route:application', Route.extend());
        app.register('route:account', Route.extend());
        app.register('route:home', Route.extend());
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
      map() {
        this.route('home');
        this.authenticatedRoute('account');
      }
    });
    var applicationRoute = lookup(app, 'route:application');
    var authenticatedRoute = lookup(app, 'route:account');

    assert.ok(applicationRoute.checkLogin, "checkLogin function is present");
    assert.ok(authenticatedRoute.authenticate, "authenticate function is present");
  });

  test('session.attemptedTransition is set before redirecting away from authenticated route', async function(assert){
    assert.expect(1);

    configuration.sessionServiceName = 'session';
    let attemptedTransition = null;

    bootApp({
      map() {
        this.route('public');
        this.authenticatedRoute('secret');
      },
      setup() {
        app.register('route:application', Route.extend());
        app.register('route:secret', Route.extend());
      }
    });

    var applicationRoute = lookup(app, 'route:application');
    applicationRoute.reopen({
      actions: {
        accessDenied() {
          attemptedTransition = this.get('session').attemptedTransition;
        }
      }
    });

    /* eslint-disable no-undef */
    return visit('/secret').then(function(){
        assert.ok(!!attemptedTransition, 'attemptedTransition was set');
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

    run(function(){
      app.advanceReadiness();
    });

    return app.boot();
  }
});
