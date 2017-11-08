import Ember from 'ember';
import QUnit from 'qunit';
import { buildQueryString } from 'torii/lib/query-string';

let { module, test } = QUnit;
let { freeze } = Object;

const get = Ember.get;

let obj,
  objGetter,
  clientId = 'abcdef',
  responseType = 'code',
  redirectUri = 'http://localhost.dev:3000/xyz/pdq',
  optionalProperty = 'i-am-optional';

module('QueryString - Unit', {
  beforeEach() {
    obj = Ember.Object.create({
      clientId:         clientId,
      responseType:     responseType,
      redirectUri:      redirectUri,
      additional_param: 'not-camelized',
      optionalProperty: optionalProperty,
      falseProp: false
    });

    objGetter = (keyName) => {
      return get(obj, keyName);
    };
  },
  afterEach() {
    Ember.run(obj, 'destroy');
  }
});

test('#buildQueryString - looks up properties by camelized name', function(assert) {
  const qs = buildQueryString(objGetter, ['client_id']);

  assert.equal(
    qs,
    `client_id=${clientId}`,
    'sets client_id from clientId property'
  );
});

test('#buildQueryString - does not fail when requiredParams or optionalParams are frozen', function(assert) {
  assert.ok(
    buildQueryString(
      objGetter,
      freeze(['client_id']),
      freeze(['optional_property'])
    )
  );
});

test('#buildQueryString - joins properties with "&"', function(assert) {
  const qs = buildQueryString(objGetter, ['client_id', 'response_type']);

  assert.equal(
    qs,
    `client_id=${clientId}&response_type=${responseType}`,
    'joins client_id and response_type'
  );
});

test('#buildQueryString - url encodes values', function(assert) {
  const qs = buildQueryString(objGetter, ['redirect_uri']);

  assert.equal(
    qs,
    'redirect_uri=http%3A%2F%2Flocalhost.dev%3A3000%2Fxyz%2Fpdq',
    'encodes uri components'
  );
});

test('#buildQueryString - assert.throws error if property exists as non-camelized form', function(assert) {
  assert.throws(
    () => {
      buildQueryString(objGetter, ['additional_param']);
    },
    /camelized versions of url params/,
    'assert.throws error when the non-camelized property name exists'
  );
});

test('#buildQueryString - assert.throws error if property does not exist', function(assert) {
  assert.throws(
    () => {
      buildQueryString(objGetter, ['nonexistent_property']);
    },
    /Missing url param.*nonexistent_property/,
    'assert.throws error when property does not exist'
  );
});

test('#buildQueryString - no error thrown when specifying optional properties that do not exist', function(assert) {
  const qs = buildQueryString(objGetter, [], ['nonexistent_property']);

  assert.equal(
    qs,
    '',
    'empty query string with nonexistent optional param'
  );
});

test('#buildQueryString - optional properties is added if it does exist', function(assert) {
  const qs = buildQueryString(objGetter, [], ['optional_property']);

  assert.equal(
    qs,
    `optional_property=${optionalProperty}`,
    'optional_property is populated when the value is there'
  );
});

test('#buildQueryString - value of false gets into url', function(assert) {
  const qs = buildQueryString(objGetter, ['false_prop']);

  assert.equal(
    qs,
    'false_prop=false',
    'false_prop is in url even when false'
  );
});

test('#buildQueryString - uniq-ifies required params', function(assert) {
  const qs = buildQueryString(objGetter, ['client_id', 'client_id']);

  assert.equal(
    qs,
    `client_id=${clientId}`,
    'only includes client_id once'
  );
});

test('#buildQueryString - uniq-ifies optional params', function(assert) {
  const qs = buildQueryString(objGetter, [], ['client_id', 'client_id']);

  assert.equal(
    qs,
    `client_id=${clientId}`,
    'only includes client_id once'
  );
});

test('#buildQueryString - assert.throws if optionalParams includes any requiredParams', function(assert) {
  assert.throws(
    () => {
      buildQueryString(objGetter, ['client_id'], ['client_id']);
    },
    /required parameters cannot also be optional/i
  );
});
