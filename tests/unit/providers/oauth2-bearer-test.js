import { configure } from 'torii/configuration';
import { module, test } from 'qunit';

import BaseProvider from 'torii/providers/oauth2-bearer';

module('Unit | Provider | MockOauth2Provider (oauth2-bearer subclass)', function(hooks) {
  const Provider = BaseProvider.extend({
    name: 'mock-oauth2',
    baseUrl: 'http://example.com',
    redirectUri: 'http://foo',
    responseParams: ['state', 'access_token'],

    popup: {
      async open(_1, _2, assert) /*url, responseParams*/{
        assert && assert.ok(true, 'calls popup.open');
        return { state: 'state' };
      }
    }
  });

  hooks.beforeEach(function() {
    configure({
      providers: {
        'mock-oauth2': {}
      }
    });
  });

  test("BaseProvider subclass must have baseUrl", function(assert){
    const Subclass = BaseProvider.extend();
    const provider = Subclass.create();

    assert.throws(function(){
      provider.buildUrl();
    }, /Definition of property baseUrl by a subclass is required./);
  });

  test("Provider generates a URL with required config", function(assert){
    configure({
      providers: {
        'mock-oauth2': {
          apiKey: 'dummyKey'
        }
      }
    });

    const provider = Provider.create();
    assert.equal(provider.buildUrl(), 'http://example.com?response_type=token&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&state=' + provider.get('state'),
          'generates the correct URL');
  });

  test("Provider generates a URL with optional scope", function(assert){
    configure({
      providers: {
        'mock-oauth2': {
          apiKey: 'dummyKey',
          scope: 'someScope'
        }
      }
    });

    const provider = Provider.create();

    assert.equal(provider.buildUrl(), 'http://example.com?response_type=token&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&state=' + provider.get('state') + '&scope=someScope',
          'generates the correct URL');
  });

  test('Provider#open assert.throws when any required response params are missing', function(assert){
    assert.expect(3);

    configure({
      providers: {
        'mock-oauth2': {
          apiKey: 'dummyKey',
          scope: 'someScope'
        }
      }
    });

    const provider = Provider.create();

    return provider.open(assert)
    .then(function(){
        assert.ok(false, '#open should not resolve');
      })
      .catch(function(e){
        assert.ok(true, 'failed');
        const message = e.toString().split('\n')[0];
        assert.equal(message, 'Error: The response from the provider is missing these required response params: access_token');
      });
  });
});
