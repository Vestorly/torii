import { getConfiguration, configure } from 'torii/configuration';
import StripeConnectProvider from 'torii/providers/stripe-connect';
import QUnit from 'qunit';

let { module, test } = QUnit;
let provider;
let originalConfiguration;


module('Unit - StripeConnectProvider', {
  setup: function(){
    originalConfiguration = getConfiguration();
    configure({
      providers: {
        'stripe-connect': {}
      }
    });
    provider = StripeConnectProvider.create();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configure(originalConfiguration);
  }
});

test("Provider requires an apiKey", function(assert){
  assert.throws(function(){
    provider.buildUrl();
  }, /Expected configuration value apiKey to be defined.*stripe-connect/);
});

test("Provider generates a URL with required config", function(assert){
  configure({
    providers: {
      'stripe-connect': {
        apiKey: 'abcdef'
      }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=code' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=' + provider.get('state') +
          '&scope=read_write' +
          '&always_prompt=false';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});

test("Provider generates a URL with optional parameters", function(assert){
  configure({
    providers: {
      'stripe-connect': {
        apiKey: 'abcdef',
        scope: 'read_only',
        stripeLanding: 'login',
        alwaysPrompt: true
      }
    }
  });

  var expectedUrl = provider.get('baseUrl') + '?' + 'response_type=code' +
          '&client_id=' + 'abcdef' +
          '&redirect_uri=' + encodeURIComponent(provider.get('redirectUri')) +
          '&state=' + provider.get('state') +
          '&scope=read_only' +
          '&stripe_landing=login' +
          '&always_prompt=true';

  assert.equal(provider.buildUrl(),
        expectedUrl,
        'generates the correct URL');
});
