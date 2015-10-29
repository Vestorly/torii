var provider;

import configuration from 'torii/configuration';

import OpenIDConnect from 'torii/providers/openid-connect';

module('Unit - OpenIDConnect Provider', {
  setup: function(){
    configuration.providers['openid-connect'] = {};
    provider = new OpenIDConnect();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configuration.providers['openid-connect']  = {};
  }
});

test("Provider requires an apiKey", function(){
  configuration.providers['openid-connect'] = {};
  throws(function(){
    provider.buildUrl();
  }, /Expected configuration value providers.openid-connect.baseUrl to be defined!/);
});

test("Provider generates a URL with required config", function(){
  configuration.providers['openid-connect'] = {
    clientId: 'abcdef',
    baseUrl: 'http://example.com'
  };

  // hacky solution to get it to understand I've overridden optionalUrlParams
  provider.set('optionalUrlParams', []);

  // set the nonce myself so it's testable
  provider.set('nonce', '1234-abcd');

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=token' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=STATE' +
          '&nonce=1234-abcd' +
          '&response_mode=query' +
          '&scope=openid%20email';

  equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});
