import { configure } from 'torii/configuration';
import { module, test } from 'qunit';

import BaseProvider from 'torii/providers/oauth1';

module('Unit | Provider | MockOauth1Provider (oauth1 subclass)', function(hooks) {
  let provider;
  let providerName = 'mock-oauth1';

  const Provider = BaseProvider.extend({
    name: providerName,
    baseUrl: 'http://example.com',
    redirectUri: 'http://foo'
  });

  hooks.beforeEach(function() {
    configure({
      providers: {
        [providerName]: {}
      }
    });

    provider = Provider.create();
  });

  test("Provider requires a requestTokenUri", function(assert) {
    assert.throws(function(){
      provider.buildRequestTokenUrl();
    }, /Expected configuration value requestTokenUri to be defined.*mock-oauth1/);
  });

  test("buildRequestTokenUrl generates a URL with required config", function(assert) {
    configure({
        providers: {
          [providerName]: {
            requestTokenUri: 'http://expectedUrl.com'
          }
        }
    });

    assert.equal(provider.buildRequestTokenUrl(), 'http://expectedUrl.com',
          'generates the correct URL');
  });
});
