var provider;

import { getConfiguration, configure } from 'torii/configuration';

import EdmodoConnectProvider from 'torii/providers/edmodo-connect';
import QUnit from 'qunit';

let { module, test } = QUnit;
let originalConfiguration;

module('Unit - EdmodoConnectProvider', {
  setup: function(){
    originalConfiguration = getConfiguration();
    configure({
      providers: {
        'edmodo-connect': {}
      }
    });
    provider = EdmodoConnectProvider.create();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configure(originalConfiguration);
  }
});

test("Provider requires an apiKey", function(assert){
  assert.throws(function(){
    provider.buildUrl();
  }, /Expected configuration value apiKey to be defined.*edmodo-connect/);
});

test("Provider requires a redirectUri", function(assert){
  configure({
    providers: {
      'edmodo-connect': {
        apiKey: 'abcdef'
      }
    }
  });
  assert.throws(function(){
    provider.buildUrl();
  }, /Expected configuration value redirectUri to be defined.*edmodo-connect/);
});

test("baseUrl is 'https://api.edmodo.com/oauth/authorize'", function(assert) {
  assert.equal(provider.get('baseUrl'), 'https://api.edmodo.com/oauth/authorize');
});

test("Provider generates a URL with required config", function(assert){
  configure({
    providers: {
      'edmodo-connect': {
        apiKey: 'abcdef',
        redirectUri: 'http://localhost:4200/edmodo/callback'
      }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=token' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent('http://localhost:4200/edmodo/callback') +
          '&state=' + encodeURIComponent(provider.get('state')) +
          '&scope=basic';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});
