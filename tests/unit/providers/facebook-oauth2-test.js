import { module, test } from 'qunit';
import { configure } from 'torii/configuration';

import FacebookProvider from 'torii/providers/facebook-oauth2';

module('Unit | Provider | FacebookOAuth2Provider', function(hooks) {
  let provider;

  hooks.beforeEach(function() {
    configure({
      providers: {
        'facebook-oauth2': {}
      }
    });

    provider = FacebookProvider.create();
  });

  test("Provider generates an unversioned path if no API version is configured", function(assert){
    configure({
      providers: {
        'facebook-oauth2': {
          apiKey: 'abcdef'
        }
      }
    });

    assert.ok(provider.buildUrl().startsWith('https://www.facebook.com/dialog/oauth'));
  });

  test("Provider generates a versioned path if an API version is configured", function(assert){
    configure({
      providers: {
        'facebook-oauth2': {
          apiKey: 'abcdef',
          apiVersion: 'v3.2'
        }
      }
    });

    assert.ok(provider.buildUrl().startsWith('https://www.facebook.com/v3.2/dialog/oauth'));
  });

  test("Throws an error if the version does not have the right shape", function(assert){
    configure({
      providers: {
        'facebook-oauth2': {
          apiKey: 'abcdef',
          apiVersion: '3.2'
        }
      }
    });

    assert.throws(
      function() {
        provider.buildUrl();
      }
    );
  });
});
