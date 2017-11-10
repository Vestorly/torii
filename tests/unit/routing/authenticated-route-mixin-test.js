import AuthenticatedRouteMixin from 'torii/routing/authenticated-route-mixin';
import QUnit from 'qunit';
import { configure, getConfiguration } from 'torii/configuration';

let { module, test } = QUnit;
let originalConfiguration;

module('Unit | Routing | Authenticated Route Mixin', {
  beforeEach() {
    originalConfiguration = getConfiguration();
    configure({
      sessionServiceName: 'session'
    });
  },
  afterEach() {
    configure(originalConfiguration);
  }
});

test("beforeModel calls authenicate after _super#beforeModel", function(assert){
  var route;
  var callOrder = [];
  route = Ember.Route
    .extend({
      beforeModel: function() {
        callOrder.push('super');
      }
    })
    .extend(AuthenticatedRouteMixin, {
      authenticate: function() {
        callOrder.push('mixin');
      }
    }).create();

  route.beforeModel();

  assert.deepEqual(callOrder, ['super', 'mixin'],
    'super#beforeModel is called before authenicate');
});

test("route respects beforeModel super priority when promise is returned", function(assert){
  var route;
  var callOrder = [];
  route = Ember.Route
    .extend({
      beforeModel: function() {
        return new Ember.RSVP.Promise(function(resolve){
          Ember.run.later(function(){
            callOrder.push('super');
            resolve();
          }, 20);
        });
      }
    })
    .extend(AuthenticatedRouteMixin, {
      authenticate: function() {
        callOrder.push('mixin');
      }
    }).create();

  return route.beforeModel()
    .then(function(){
      assert.deepEqual(callOrder, ['super', 'mixin'],
        'super#beforeModel is called before authenticate');
    });
});

test('previously successful authentication results in successful resolution', function(assert){
  assert.expect(1);
  var route = createAuthenticatedRoute({
    session: {
      isAuthenticated: true
    }
  });

  return route.authenticate()
    .then(function(){
      assert.ok(true);
    });
});

test('attempting authentication calls fetchDefaultProvider', function(assert){
  assert.expect(1);
  var fetchCalled = false;
  var route = createAuthenticatedRoute({
    session: {
      isAuthenticated: undefined,
      fetch: function(){
        fetchCalled = true;
        return Ember.RSVP.resolve();
      }
    }
  });
  return route.authenticate()
    .then(function(){
      assert.ok(fetchCalled, 'fetch default provider was called');
    });
});

test('failed authentication calls accessDenied', function(assert){
  assert.expect(2);
  var fetchCalled = false;
  var accessDeniedCalled = false;
  var route = createAuthenticatedRoute({
    session: {
      isAuthenticated: undefined,
      fetch: function(){
        fetchCalled = true;
        return Ember.RSVP.reject();
      }
    },
    accessDenied: function() {
      accessDeniedCalled = true;
    }
  });
  return route.authenticate()
    .then(function(){
      assert.ok(fetchCalled, 'fetch default provider was called');
      assert.ok(accessDeniedCalled, 'accessDenied was called');
    });
});

test('failed authentication causes accessDenied action to be sent', function(assert){
  assert.expect(2);
  var fetchCalled = false;
  var sentActionName;
  var route = createAuthenticatedRoute({
    session: {
      isAuthenticated: undefined,
      fetch: function(){
        fetchCalled = true;
        return Ember.RSVP.reject();
      }
    }
  });
  return route.authenticate({
    send: function(actionName) {
      sentActionName = actionName;
    }
  })
    .then(function(){
      assert.ok(fetchCalled, 'fetch default provider was called');
      assert.equal(sentActionName, 'accessDenied', 'accessDenied action was sent');
    });
});

test('failed authentication causes accessDenied action to be sent with transition', function(assert){
  assert.expect(2);
  var fetchCalled = false;
  var sentTransition;
  var transition = {
    targetName: 'custom.route'
  };

  var route = createAuthenticatedRoute({
    session: {
      isAuthenticated: undefined,
      fetch: function(){
        fetchCalled = true;
        return Ember.RSVP.reject();
      }
    },

    accessDenied: function(transition) {
      sentTransition = transition;
    }
  });
  return route.authenticate(transition)
    .then(function(){
      assert.ok(fetchCalled, 'fetch default provider was called');
      assert.deepEqual(sentTransition, transition, 'transition was sent');
    });
});

function createAuthenticatedRoute(attrs) {
  return Ember.Router.extend(AuthenticatedRouteMixin, attrs).create();
}
