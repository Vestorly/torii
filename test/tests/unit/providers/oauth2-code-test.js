var provider, tokenProvider;

import configuration from 'torii/configuration';

var originalConfiguration = configuration.providers['mock-oauth2'];
var originalTokenConfiguration = configuration.providers['mock-oauth2-token'];

import BaseProvider from 'torii/providers/oauth2-code';

var Provider = BaseProvider.extend({
  name: 'mock-oauth2',
  baseUrl: 'http://example.com',
  redirectUri: 'http://foo',
  responseParams: ['authorization_code'],
});

var TokenProvider = BaseProvider.extend({
  name: 'mock-oauth2-token',
  baseUrl: 'http://example.com',
  redirectUri: 'http://foo',
  responseParams: ['authorization_code'],
  responseType: 'token_id'
});

module('MockOauth2Provider (oauth2-code subclass) - Unit', {
  setup: function(){
    configuration.providers['mock-oauth2'] = {};
    provider = new Provider();
    tokenProvider = new TokenProvider();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
    configuration.providers['mock-oauth2'] = originalConfiguration;
    configuration.providers['mock-oauth2'] = originalTokenConfiguration;
  }
});

test("BaseProvider subclass must have baseUrl", function(){
  var Subclass = BaseProvider.extend();
  var provider = Subclass.create();
  throws(function(){
    provider.buildUrl();
  }, /Definition of property baseUrl by a subclass is required./);
});

test("Provider requires an apiKey", function(){
  configuration.providers['mock-oauth2'] = {};
  throws(function(){
    provider.buildUrl();
  }, /Expected configuration value providers.mock-oauth2.apiKey to be defined!/);
});

test("Provider does not require a redirectUri", function(){
  configuration.providers['mock-oauth2'] = { apiKey: 'dummyKey' }
  provider.redirectUri = null;

  var error;

  try {
    provider.buildUrl();
    error = false;
  } catch(e) {
    error = e;
  }

  ok(error === false, 'should not throw an error, but "' + error + '" was thrown');
});

test("Provider generates a URL with required config", function(){
  configuration.providers['mock-oauth2'] = {
    apiKey: 'dummyKey'
  };
  equal(provider.buildUrl(), 'http://example.com?response_type=code&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo',
        'generates the correct URL');
});

test("Provider generates a URL with optional scope", function(){
  configuration.providers['mock-oauth2'] = {
    apiKey: 'dummyKey',
    scope: 'someScope'
  };
  equal(provider.buildUrl(), 'http://example.com?response_type=code&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&scope=someScope',
        'generates the correct URL');
});

test('Provider#open throws when any required response params are missing', function(){
  expect(3);

  configuration.providers['mock-oauth2'] = {
    apiKey: 'dummyKey',
    scope: 'someScope'
  };

  var mockPopup = {
    open: function(url, responseParams){
      ok(true, 'calls popup.open');

      return Ember.RSVP.resolve({});
    }
  };

  provider.set('popup', mockPopup);

  Ember.run(function(){
    provider.open().then(function(){
      ok(false, '#open should not resolve');
    }).catch(function(e){
      ok(true, 'failed');
      var regex = /missing these required response params.*authorization_code/i;
      ok(regex.test(e), 'error message includes "missing these required response params"');
    });
  });
});

test('should use the value of provider.responseType as key for the authorizationCode', function(){
  expect(2);

  configuration.providers['mock-oauth2-token'] = {
    apiKey: 'dummyKey',
    scope: 'someScope',
  };

  var mockPopup = {
    open: function(url, responseParams){
      ok(true, 'calls popup.open');
      return Ember.RSVP.resolve({ 'token_id': 'test', 'authorization_code': 'pief' });
    }
  };

  tokenProvider.set('popup', mockPopup);

  Ember.run(function(){
    tokenProvider.open().then(function(res){
      ok(res.authorizationCode === 'test', 'authenticationToken present')
    });
  });
});
