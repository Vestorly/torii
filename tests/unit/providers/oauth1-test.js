import { getConfiguration, configure } from 'torii/configuration';

import QUnit from 'qunit';

let { module, test } = QUnit;
let provider;
let originalConfiguration;

import BaseProvider from 'torii/providers/oauth1';

var providerName = 'mock-oauth1';

var Provider = BaseProvider.extend({
  name: providerName,
  baseUrl: 'http://example.com',
  redirectUri: 'http://foo'
});

module('MockOauth1Provider (oauth1 subclass) - Unit', {
  setup: function(){
    originalConfiguration = getConfiguration();
    configure({
      providers: {
        [providerName]: {}
      }
    });
    provider = Provider.create();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configure(originalConfiguration);
  }
});

test("Provider requires a requestTokenUri", function(assert){
  assert.throws(function(){
    provider.buildRequestTokenUrl();
  }, /Expected configuration value requestTokenUri to be defined.*mock-oauth1/);
});

test("buildRequestTokenUrl generates a URL with required config", function(assert){
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
