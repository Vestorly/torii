import { module, test } from 'qunit';
import {  configure } from 'torii/configuration';

import GoogleBearerProvider from 'torii/providers/google-oauth2-bearer';

module('Unit | Provider | GoogleAuth2BearerProvider', function(hooks) {
  let provider;

  hooks.beforeEach(function() {
    configure({
      providers: {
        'google-oauth2-bearer': {}
      }
    });

    provider = GoogleBearerProvider.create();
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

    const expectedUrl = provider.get('baseUrl') + '?' + 'response_type=token' +
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

    const expectedUrl = provider.get('baseUrl') + '?' + 'response_type=token' +
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
});
