var torii, container;

import toriiContainer from 'test/helpers/torii-container';
import configuration from 'torii/configuration';
import MockPopup from 'test/helpers/mock-popup';

var originalConfiguration = configuration.providers['openid-connect'];

var mockPopup = new MockPopup({
  response: { 'id_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MzI2ODg5M30.4-iaDojEVl0pJQMjrbM1EzUIfAZgsbK_kgnVyVxFSVo' }
});

var failPopup = new MockPopup({
  state: 'invalid-state',
  response: { 'id_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MzI2ODg5M30.4-iaDojEVl0pJQMjrbM1EzUIfAZgsbK_kgnVyVxFSVo' }
});

var registry, container;

module('OpenID Connect - Integration', {
  setup: function(){
    var results = toriiContainer();
    registry = results[0];
    container = results[1];
    registry.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    registry.register('torii-service:fail-popup', failPopup, {instantiate: false});
    registry.injection('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = container.lookup("service:torii");
    configuration.providers['openid-connect'] = {
      clientId: 'dummy',
      baseUrl: 'http://example.com'
    };
  },
  teardown: function(){
    mockPopup.opened = false;
    configuration.providers['openid-connect'] = originalConfiguration;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to the specified url", function(){
  Ember.run(function(){
    torii.open('openid-connect').finally(function(){
      ok(mockPopup.opened, "Popup service is opened");
      ok(/example.com/.test(mockPopup.url), "Opened to the correct url");
    });
  });
});

test('Validates the state parameter in the response', function(){
  registry.injection('torii-provider', 'popup', 'torii-service:fail-popup');

  Ember.run(function(){
    torii.open('openid-connect').then(null, function(e){
      ok(/has an incorrect session state/.test(e.message),
         'authentication fails due to invalid session state response');
    });
  });
});
