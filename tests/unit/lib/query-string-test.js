import Ember from 'ember';
import QueryString from 'torii/lib/query-string';
import QUnit from 'qunit';

let { module, test } = QUnit;

var obj,
    clientId = 'abcdef',
    responseType = 'code',
    redirectUri = 'http://localhost.dev:3000/xyz/pdq',
    optionalProperty = 'i-am-optional';

module('QueryString - Unit', {
  setup: function(){
    obj = Ember.Object.create({
      clientId:         clientId,
      responseType:     responseType,
      redirectUri:      redirectUri,
      additional_param: 'not-camelized',
      optionalProperty: optionalProperty,
      falseProp: false
    });
  },
  teardown: function(){
    Ember.run(obj, 'destroy');
  }
});

test('looks up properties by camelized name', function(assert){
  var qs = QueryString.create({provider: obj, requiredParams: ['client_id']});

  assert.equal(qs.toString(), 'client_id='+clientId,
        'sets client_id from clientId property');
});

test('joins properties with "&"', function(assert){
  var qs = QueryString.create({provider: obj, requiredParams: ['client_id','response_type']});

  assert.equal(qs.toString(),
        'client_id='+clientId+'&response_type='+responseType,
        'joins client_id and response_type');
});

test('url encodes values', function(assert){
  var qs = QueryString.create({provider: obj, requiredParams: ['redirect_uri']});

  assert.equal(qs.toString(),
        'redirect_uri=http%3A%2F%2Flocalhost.dev%3A3000%2Fxyz%2Fpdq',
        'encodes uri components');
});

test('assert.throws error if property exists as non-camelized form', function(assert){
  var qs = QueryString.create({provider: obj, requiredParams: ['additional_param']});

  assert.throws(function(){
    qs.toString();
  }, /camelized versions of url params/,
     'assert.throws error when the non-camelized property name exists');
});

test('assert.throws error if property does not exist', function(assert){
  var qs = QueryString.create({provider: obj, requiredParams: ['nonexistent_property']});

  assert.throws(function(){
    qs.toString();
  }, /Missing url param.*nonexistent_property/,
     'assert.throws error when property does not exist');
});

test('no error thrown when specifying optional properties that do not exist', function(assert){
  var qs = QueryString.create({
    provider: obj,
    requiredParams: [],
    optionalParams: ['nonexistent_property']
  });

  assert.equal(qs.toString(), '',
        'empty query string with nonexistent optional param');

});

test('optional properties is added if it does exist', function(assert){
  var qs = QueryString.create({
    provider: obj,
    requiredParams: [],
    optionalParams: ['optional_property']
  });

  assert.equal(qs.toString(), 'optional_property='+optionalProperty,
        'optional_property is populated when the value is there');

});

test('value of false gets into url', function(assert){
  var qs = QueryString.create({
    provider: obj,
    requiredParams: ['false_prop']
  });

  assert.equal(qs.toString(), 'false_prop=false',
        'false_prop is in url even when false');

});

test('uniq-ifies required params', function(assert){
  var qs = QueryString.create({
    provider: obj,
    requiredParams: ['client_id', 'client_id']
  });

  assert.equal(qs.toString(), 'client_id='+clientId,
        'only includes client_id once');
});

test('uniq-ifies optional params', function(assert){
  var qs = QueryString.create({
    provider: obj,
    requiredParams: [],
    optionalParams: ['client_id', 'client_id']
  });

  assert.equal(qs.toString(), 'client_id='+clientId,
        'only includes client_id once');
});

test('assert.throws if optionalParams includes any requiredParams', function(assert){
  assert.throws(function(){
    QueryString.create({
      provider: obj,
      requiredParams: ['client_id'],
      optionalParams: ['client_id']
    });
  }, /required parameters cannot also be optional/i);
});
