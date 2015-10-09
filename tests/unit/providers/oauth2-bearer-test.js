import { getConfiguration, configure } from 'torii/configuration';

import BaseProvider from 'torii/providers/oauth2-bearer';
import QUnit from 'qunit';

let { module, test } = QUnit;
let provider;
let originalConfiguration;

var Provider = BaseProvider.extend({
  name: 'mock-oauth2',
  baseUrl: 'http://example.com',
  redirectUri: 'http://foo',
  responseParams: ['state', 'access_token']
});

module('MockOauth2Provider (oauth2-bearer subclass) - Unit', {
  setup: function(){
    originalConfiguration = getConfiguration();
    configure({
      providers: {
        'mock-oauth2': {}
      }
    });
    provider = Provider.create();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configure(originalConfiguration);
  }
});

test("BaseProvider subclass must have baseUrl", function(assert){
  var Subclass = BaseProvider.extend();
  var provider = Subclass.create();
  assert.throws(function(){
    provider.buildUrl();
  }, /Definition of property baseUrl by a subclass is required./);
});

test("Provider requires an apiKey", function(assert){
  assert.throws(function(){
    provider.buildUrl();
  }, /Expected configuration value apiKey to be defined.*mock-oauth2/);
});

test("Provider generates a URL with required config", function(assert){
  configure({
    providers: {
      'mock-oauth2': {
        apiKey: 'dummyKey'
      }
    }
  });
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

  var mockPopup = {
    open: function(/*url, responseParams*/){
      assert.ok(true, 'calls popup.open');

      return Ember.RSVP.resolve({state: 'state'});
    }
  };

  provider.set('popup', mockPopup);

  Ember.run(function(){
    provider.open().then(function(){
      assert.ok(false, '#open should not resolve');
    }).catch(function(e){
      assert.ok(true, 'failed');
      var message = e.toString().split('\n')[0];
      assert.equal(message, 'Error: The response from the provider is missing these required response params: access_token');
    });
  });
});
