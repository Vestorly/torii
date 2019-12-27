import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { configure } from 'torii/configuration';
import BaseProvider from 'torii/providers/oauth2-code';

module('Unit | Provider | MockOauth2Provider (oauth2-code subclass)', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    configure({
      providers: {
        'mock-oauth2': {}
      }
    });
  });

  const Provider = BaseProvider.extend({
    name: 'mock-oauth2',
    baseUrl: 'http://example.com',
    redirectUri: 'http://foo',
    responseParams: ['state', 'authorization_code'],
  });

  const TokenProvider = BaseProvider.extend({
    name: 'mock-oauth2-token',
    baseUrl: 'http://example.com',
    redirectUri: 'http://foo',
    responseParams: ['authorization_code'],
    responseType: 'token_id'
  });

  test("BaseProvider subclass must have baseUrl", function(assert){
    const Subclass = BaseProvider.extend();
    const provider = Subclass.create();

    assert.throws(function(){
      provider.buildUrl();
    }, /Definition of property baseUrl by a subclass is required./);
  });

  test("Provider requires an apiKey", function(assert){
    const provider = Provider.create();
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

    const provider = Provider.create();
    const state = provider.get('state');

    assert.equal(provider.buildUrl(), 'http://example.com?response_type=code&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&state=' + state,
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
    const state = provider.get('state');

    assert.equal(provider.buildUrl(), 'http://example.com?response_type=code&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&state=' + state + '&scope=someScope',
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

    const MyProvider = Provider.extend({
      popup: {
        async open() /*url, responseParams*/{
          assert.ok(true, 'calls popup.open');
          return {state: 'state'}
        }
      }
    });

    const provider = MyProvider.create();

    return provider.open().then(function(){
      assert.ok(false, '#open should not resolve');
    }).catch(function(e){
      assert.ok(true, 'failed');
      const message = e.toString().split('\n')[0];
      assert.equal(message, 'Error: The response from the provider is missing these required response params: authorization_code');
    });
  });

  test('should use the value of provider.responseType as key for the authorizationCode', function(assert){
    assert.expect(2);

    configure({
      providers: {
        'mock-oauth2-token': {
          apiKey: 'dummyKey',
          scope: 'someScope',
          state: 'test-state'
        }
      }
    });

    const MyProvider = TokenProvider.extend({
      popup: {
        async open() /*url, responseParams*/{
          assert.ok(true, 'calls popup.open');
          return { 'token_id': 'test', 'authorization_code': 'pief', 'state': 'test-state' };
        }
      }
    });

    const tokenProvider = MyProvider.create();

    return tokenProvider.open().then(function(res){
      assert.ok(res.authorizationCode === 'test', 'authenticationToken present');
    });
  });

  test('provider generates a random state parameter', function(assert){
    assert.expect(1);

    const provider = Provider.create();
    const state = provider.get('state');

    assert.ok(/^[A-Za-z0-9]{16}$/.test(state), 'state is 16 random characters');
  });

  test('provider caches the generated random state', function(assert){
    assert.expect(1);

    const provider = Provider.create();
    const state = provider.get('state');

    assert.equal(provider.get('state'), state, 'random state value is cached');
  });

  test('can override state property', function(assert){
    assert.expect(1);

    configure({
      providers: {
        'mock-oauth2': {
          state: 'insecure-fixed-state'
        }
      }
    });

    const provider = Provider.create();
    const state = provider.get('state');

    assert.equal(state, 'insecure-fixed-state',
          'specified state property is set');
  });

  test('URI-decodes the authorization code', function(assert){
    assert.expect(1);

    configure({
      providers: {
        'mock-oauth2-token': {
          apiKey: 'dummyKey',
          scope: 'someScope',
          state: 'test-state'
        }
      }
    });

    const MyProvider = TokenProvider.extend({
      popup: {
        async open() /*url, responseParams*/{
          return {
            'token_id': encodeURIComponent('test=='),
            'authorization_code': 'pief',
            'state': 'test-state'
          };
        }
      }
    });

    const tokenProvider = MyProvider.create();

    return tokenProvider.open().then(function(res){
      assert.equal(res.authorizationCode, 'test==', 'authorizationCode decoded');
    });
  });
});
