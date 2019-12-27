import { later } from '@ember/runloop';
import { Promise as EmberPromise, reject } from 'rsvp';
import Route from '@ember/routing/route';
import ApplicationRouteMixin from 'torii/routing/application-route-mixin';
import { module, test } from 'qunit';
import { configure, getConfiguration } from 'torii/configuration';

let originalConfiguration;

module('Unit | Routing | Application Route Mixin', function(hooks) {
  hooks.beforeEach(function() {
    originalConfiguration = getConfiguration();
    configure({
      sessionServiceName: 'session'
    });
  });

  hooks.afterEach(function() {
    configure(originalConfiguration);
  });

  test("beforeModel calls checkLogin after _super#beforeModel", function(assert){
    const callOrder = [];
    const route = Route
      .extend({
        beforeModel() {
          callOrder.push('super');
        }
      })
      .extend(ApplicationRouteMixin, {
        checkLogin() {
          callOrder.push('mixin');
        }
      }).create();

    route.beforeModel();

    assert.deepEqual(callOrder, ['super', 'mixin'],
      'super#beforeModel is called mixin#beforeModel');
  });

  test("beforeModel calls checkLogin after promise from _super#beforeModel is resolved", function(assert){
    const callOrder = [];
    const route = Route
      .extend({
        beforeModel() {
          return new EmberPromise(function(resolve){
            later(function(){
              callOrder.push('super');
              resolve();
            }, 20);
          });
        }
      })
      .extend(ApplicationRouteMixin, {
        checkLogin() {
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

    let fetchCalled = false;
    const route = Route.extend(ApplicationRouteMixin, {
      session: {
        fetch() {
          fetchCalled = true;
          return reject('no session is available');
        }
      }
    }).create();

    return route.checkLogin()
      .then(function(){
        assert.ok(fetchCalled, 'fetch default provider was called');
        assert.ok('successful callback in spite of rejection');
      });
  });
});
