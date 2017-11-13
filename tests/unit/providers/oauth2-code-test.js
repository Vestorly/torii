import { getConfiguration, configure } from 'torii/configuration';
import BaseProvider from 'torii/providers/oauth2-code';
import QUnit from 'qunit';
import sinon from 'sinon';

let { module, test } = QUnit;
let provider;
let tokenProvider;
let originalConfiguration;

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

module('Unit | Provider | MockOauth2Provider (oauth2-code subclass)', {
  beforeEach() {
    originalConfiguration = getConfiguration();
    configure({
      providers: {
        'mock-oauth2': {},
        'mock-auth2-token': {}
      }
    });
    provider = Provider.create();
    tokenProvider = TokenProvider.create();
  },
  afterEach() {
    Ember.run(provider, 'destroy');
    configure(originalConfiguration);
  }
});

test("BaseProvider subclass must have baseUrl", function(assert) {
  const Subclass = BaseProvider.extend();
  const provider = Subclass.create({
    name: 'mock-oauth2-code'
  });

  assert.throws(
    function() {
      provider.open();
    },
    /Definition of property baseUrl by a subclass is required./
  );
});

test("Provider requires an apiKey", function(assert) {
  assert.throws(
    function(){
      provider.open();
    },
    /Expected configuration value apiKey to be defined.*mock-oauth2/
  );
});

test("Provider generates a URL with required config", function(assert) {
  configure({
    providers: {
      'mock-oauth2': {
        apiKey: 'dummyKey'
      }
    }
  });
  const state = provider.get('state');
  assert.equal(
    provider.buildUrl(),
    `http://example.com?response_type=code&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&state=${state}`,
    'generates the correct URL'
  );
});

test("Provider#open generates a URL with optional scope", function(assert) {
  const Subclass = BaseProvider.extend({
    name: 'mock-oauth2',
    baseUrl: 'http://example.com',
    responseParams: [],
    redirectUri: 'http://foo'
  });
  const provider = Subclass.create();

  configure({
    providers: {
      'mock-oauth2': {
        apiKey: 'dummyKey',
        scope: 'someScope'
      }
    }
  });

  const state = provider.get('state');

  const open = sinon.stub().resolves({});
  provider.set('popup', {
    open: open
  });

  provider.open();

  assert.ok(
    open.calledWith(
      `http://example.com?response_type=code&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&state=${state}&scope=someScope`,
    ),
    'generates the correct URL'
  );
});

test("Provider#open accepts overrideable parameters", function(assert) {
  const Subclass = BaseProvider.extend({
    name: 'mock-oauth2',
    baseUrl: 'http://example.com',
    responseParams: [],
    redirectUri: 'http://foo'
  });
  const provider = Subclass.create();

  configure({
    providers: {
      'mock-oauth2': {
        apiKey: 'dummyKey',
        scope: 'someScope'
      }
    }
  });

  const state = provider.get('state');

  const open = sinon.stub().resolves({});
  provider.set('popup', {
    open: open
  });

  provider.open({
    scope: 'overriddenScope'
  });

  assert.ok(
    open.calledWith(
      `http://example.com?response_type=code&client_id=dummyKey&redirect_uri=http%3A%2F%2Ffoo&state=${state}&scope=overriddenScope`,
    ),
    'generates the correct URL'
  );
});

test('Provider#open assert.throws when any required response params are missing', async function(assert) {
  assert.expect(2);

  configure({
    providers: {
      'mock-oauth2': {
        apiKey: 'dummyKey',
        scope: 'someScope'
      }
    }
  });

  const mockPopup = {
    open: sinon.stub().resolves({
      state: 'state'
    })
  }
  provider.set('popup', mockPopup);

  try {
    await provider.open();
  } catch (e) {
    assert.ok(mockPopup.open.called, 'calls popup.open');

    const message = e.toString().split('\n')[0];
    assert.equal(
      message,
      'Error: The response from the provider is missing these required response params: authorization_code'
    );
  }
});

test('should use the value of provider.responseType as key for the authorizationCode', async function(assert) {
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

  const mockPopup = {
    open: sinon.stub().resolves({
      token_id: 'test',
      authorization_code: 'pief',
      state: 'test-state'
    })
  }
  tokenProvider.set('popup', mockPopup);

  const res = await tokenProvider.open();

  assert.ok(mockPopup.open.called, 'calls popup.open');
  assert.equal(
    res.authorizationCode, 'test',
    'authenticationToken present'
  );
});

test('provider generates a random state parameter', function(assert) {
  assert.expect(1);

  const state = provider.get('state');

  assert.ok(
    /^[A-Za-z0-9]{16}$/.test(state),
    'state is 16 random characters'
  );
});

test('provider caches the generated random state', function(assert) {
  assert.expect(1);

  const state = provider.get('state');

  assert.equal(
    provider.get('state'), state,
    'random state value is cached'
  );
});

test('can override state property', function(assert) {
  assert.expect(1);

  configure({
    providers: {
      'mock-oauth2': {
        state: 'insecure-fixed-state'
      }
    }
  });

  const state = provider.get('state');

  assert.equal(
    state, 'insecure-fixed-state',
    'specified state property is set'
  );
});

test('URI-decodes the authorization code', async function(assert) {
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

  const mockPopup = {
    open: sinon.stub().resolves({
      token_id: encodeURIComponent('test=='),
      authorization_code: 'pief',
      state: 'test-state'
    })
  }
  tokenProvider.set('popup', mockPopup);

  const res = await tokenProvider.open();

  assert.equal(
    res.authorizationCode, 'test==',
    'authorizationCode decoded'
  );
});
