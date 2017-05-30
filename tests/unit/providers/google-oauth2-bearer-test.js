var provider;

import { getConfiguration, configure } from 'torii/configuration';

import GoogleBearerProvider from 'torii/providers/google-oauth2-bearer';
import QUnit from 'qunit';

let { module, test } = QUnit;
let originalConfiguration;

module('Unit - GoogleAuth2BearerProvider', {
  beforeEach() {
    originalConfiguration = getConfiguration();
    configure({
      providers: {
        'google-oauth2-bearer': {}
      }
    });
    provider = GoogleBearerProvider.create();
  },
  afterEach() {
    Ember.run(provider, 'destroy');
    configure(originalConfiguration);
  }
});

test("Provider requires an apiKey", function(assert){
  assert.throws(function(){
    provider.buildUrl();
  }, /Expected configuration value apiKey to be defined.*google-oauth2-bearer/);
});

test("Provider generates a URL with required config", function(assert){
  configure({
    providers: {
      'google-oauth2-bearer': {
        apiKey: 'abcdef'
      }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=token' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=' + provider.get('state') +
          '&scope=email';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});

test("Provider generates a URL with optional parameters", function(assert){
  configure({
    providers: {
      'google-oauth2-bearer': {
        apiKey: 'abcdef',
        requestVisibleActions: 'http://some-url.com',
        hd: 'google.com'
      }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=token' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=' + provider.get('state') +
          '&scope=email' +
          '&request_visible_actions=' + encodeURIComponent('http://some-url.com') +
          '&hd=google.com';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});
