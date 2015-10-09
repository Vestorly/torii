import ApplicationRouteMixin from 'torii/routing/application-route-mixin';
import QUnit from 'qunit';
import { configure, getConfiguration } from 'torii/configuration';

let { module, test } = QUnit;
let originalConfiguration;

module('Application Route Mixin - Unit', {
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

test("beforeModel calls checkLogin after _super#beforeModel", function(assert){
  var route;
  var callOrder = [];
  route = Ember.Route
    .extend({
      beforeModel: function() {
        callOrder.push('super');
      }
    })
    .extend(ApplicationRouteMixin, {
      checkLogin: function() {
        callOrder.push('mixin');
      }
    }).create();

  route.beforeModel();

  assert.deepEqual(callOrder, ['super', 'mixin'],
    'super#beforeModel is called mixin#beforeModel');
});

test("beforeModel calls checkLogin after promise from _super#beforeModel is resolved", function(assert){
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
    .extend(ApplicationRouteMixin, {
      checkLogin: function() {
        callOrder.push('mixin');
      }
    }).create();

  return route.beforeModel()
    .then(function(){
      assert.deepEqual(callOrder, ['super', 'mixin'],
        'super#beforeModel is called before mixin#beforeModel');
    });
});

test('checkLogic fails silently when no session is available', function(assert){
  assert.expect(2);

  var fetchCalled = false;
  var route = Ember.Route.extend(ApplicationRouteMixin, {
    session: {
      fetch: function() {
        fetchCalled = true;
        return Ember.RSVP.reject('no session is available');
      }
    }
  }).create();

  return route.checkLogin()
    .then(function(){
      assert.ok(fetchCalled, 'fetch default provider was called');
      assert.ok('successful callback in spite of rejection');
    });
});
