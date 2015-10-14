var torii, container, registry;

import toriiContainer from '../../helpers/torii-container';
import { configure } from 'torii/configuration';
import MockPopup from '../../helpers/mock-popup';
import QUnit from 'qunit';

let { module, test } = QUnit;

var mockPopup = new MockPopup();

var failPopup = new MockPopup({ state: 'invalid-state' });

module('Facebook OAuth2 - Integration', {
  setup: function(){
    var results = toriiContainer();
    registry = results[0];
    container = results[1];
    registry.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    registry.register('torii-service:fail-popup', failPopup, {instantiate: false});
    registry.injection('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = container.lookup("service:torii");
    configure({
      providers: {
        'facebook-oauth2': {
          apiKey: 'dummy'
        }
      }
    });
  },
  teardown: function(){
    mockPopup.opened = false;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to Facebook", function(assert){
  Ember.run(function(){
    torii.open('facebook-oauth2').finally(function(){
      assert.ok(mockPopup.opened, "Popup service is opened");
    });
  });
});

test("Resolves with an authentication object containing 'redirectUri'", function(assert){
  Ember.run(function(){
    torii.open('facebook-oauth2').then(function(data){
      assert.ok(data.redirectUri,
         'Object has redirectUri');
    }, function(err){
      assert.ok(false, 'Failed with err '+err);
    });
  });
});

test('Validates the state parameter in the response', function(assert){
  registry.injection('torii-provider', 'popup', 'torii-service:fail-popup');

  Ember.run(function(){
    torii.open('facebook-oauth2').then(null, function(e){
      assert.ok(/has an incorrect session state/.test(e.message),
         'authentication fails due to invalid session state response');
    });
  });
});
