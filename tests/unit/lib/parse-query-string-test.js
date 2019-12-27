import { module, test } from 'qunit';

import ParseQueryString from 'torii/lib/parse-query-string';

module('Unit | Lib | ParseQueryString', function(/*hooks*/) {
  test('parses each passed key', function(assert){
    const url = 'http://localhost.dev:3000/xyz/?code=abcdef';
    const parser = ParseQueryString.create({url: url, keys: ['code']});
    const result = parser.parse();

    assert.ok(result.code, 'gets code');
    assert.equal(result.code, 'abcdef', 'gets correct code');
  });

  test('parses keys without the hash fragment', function(assert){
    const url = 'http://localhost.dev:3000/xyz/?code=abcdef#notCode=other';
    const parser = ParseQueryString.create({url: url, keys: ['code']});
    const result = parser.parse();

    assert.ok(result.code, 'gets code');
    assert.equal(result.code, 'abcdef', 'gets correct code');
  });

  test('parses multiple keys', function(assert){
    const url = 'http://localhost.dev:3000/xyz/?oauth_token=xxx&oauth_verifier=yyy';
    const parser = ParseQueryString.create({url: url, keys: ['oauth_token','oauth_verifier']});
    const result = parser.parse();

    assert.ok(result.oauth_token, 'gets token');
    assert.ok(result.oauth_verifier, 'gets verifier');
    assert.equal(result.oauth_token, 'xxx', 'gets correct token');
    assert.equal(result.oauth_verifier, 'yyy', 'gets correct verifier');
  });
});
