import { getConfiguration, configure } from 'torii/configuration';
import AzureAdProvider from 'torii/providers/azure-ad-oauth2';
import QUnit from 'qunit';

let { module, test } = QUnit;

let provider;
let originalConfiguration;

module('Unit - AzureAdOAuth2Provider', {
  setup: function(){
    originalConfiguration = getConfiguration();
    configure({
      providers: {
        'azure-ad-oauth2': {}
      }
    });
    provider = AzureAdProvider.create();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configure(originalConfiguration);
  }
});

test("Provider requires an apiKey", function(assert){
  assert.throws(function(){
    provider.buildUrl();
  }, /Expected configuration value apiKey to be defined.*azure-ad-oauth2/);
});

test("Provider generates a URL with required config", function(assert){
  configure({
    providers: {
      'azure-ad-oauth2': { clientId: 'abcdef' }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=code' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=' + provider.get('state') +
          '&api-version=1.0';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});

test("Provider generates a URL with required config including the tennantId", function(assert){
  configure({
    providers: {
      'azure-ad-oauth2': {
        clientId: 'abcdef',
        tennantId: 'very-long-guid'
      }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=code' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=' + provider.get('state') +
          '&api-version=1.0';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');

  assert.ok(provider.get('baseUrl').indexOf('very-long-guid') !== -1);
});


test("Provider generates a URL with required config when using id_token", function(assert){
  configure({
    providers: {
      'azure-ad-oauth2': {
        clientId: 'abcdef',
        responseType: 'id_token',
        responseMode: 'query',
        scope: 'openid email'
      }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=id_token' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=' + provider.get('state') +
          '&api-version=1.0' +
          '&scope=openid%20email' +
          '&response_mode=query';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});
