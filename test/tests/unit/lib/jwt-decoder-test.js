import jwtDecode from 'torii/lib/jwt-decoder';

module('jwtDecode - Unit');

test('exists', function(){
  ok(jwtDecode);
});

// borrowed from auth0/jwt-decode

var token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MzI2ODg5M30.4-iaDojEVl0pJQMjrbM1EzUIfAZgsbK_kgnVyVxFSVo';

test('shoudl be able to decode a token', function () {
  var decoded = jwtDecode(token);
  equal(decoded.exp, 1393286893);
  equal(decoded.iat, 1393268893);
  equal(decoded.foo, 'bar');
});

test('should work with utf8 tokens', function () {
  var utf8_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSm9zw6kiLCJpYXQiOjE0MjU2NDQ5NjZ9.1CfFtdGUPs6q8kT3OGQSVlhEMdbuX0HfNSqum0023a0";
  var decoded = jwtDecode(utf8_token);
  equal(decoded.name, 'José');
});

test('should work with binary tokens', function () {
  var binary_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSm9z6SIsImlhdCI6MTQyNTY0NDk2Nn0.cpnplCBxiw7Xqz5thkqs4Mo_dymvztnI0CI4BN0d1t8";
  var decoded = jwtDecode(binary_token);
  equal(decoded.name, 'José');
});
