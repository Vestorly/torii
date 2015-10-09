var torii, container, registry;

import toriiContainer from '../../helpers/torii-container';
import { configure } from 'torii/configuration';
import QUnit from 'qunit';

let { module, test } = QUnit;

var providerConfig;
var opened, mockPopup;

module('Google Bearer- Integration', {
  setup: function(){
    mockPopup = {
      open: function(){
        opened = true;
        return Ember.RSVP.resolve({ access_token: 'test' });
      }
    };
    var results = toriiContainer();
    registry = results[0];
    container = results[1];
    registry.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    registry.injection('torii-provider', 'popup', 'torii-service:mock-popup');
    torii = container.lookup("service:torii");
    providerConfig = { apiKey: 'dummy' };
    configure({
      providers: {
        'google-oauth2-bearer': providerConfig
      }
    });
  },
  teardown: function(){
    opened = false;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to Google", function(assert){
  assert.expect(1);
  Ember.run(function(){
    torii.open('google-oauth2-bearer').finally(function(){
      assert.ok(opened, "Popup service is opened");
    });
  });
});

test("Opens a popup to Google with request_visible_actions", function(assert){
  assert.expect(1);
  configure({
    providers: {
      'google-oauth2-bearer': Ember.merge(providerConfig, {
        requestVisibleActions: "http://some-url.com"
      })
    }
  });
  mockPopup.open = function(url){
    assert.ok(
      url.indexOf("request_visible_actions=http%3A%2F%2Fsome-url.com") > -1,
      "request_visible_actions is present" );
    return Ember.RSVP.resolve({ access_token: 'test' });
  };
  Ember.run(function(){
    torii.open('google-oauth2-bearer');
  });
});
