import Torii from 'torii/services/torii';
import QUnit from 'qunit';

let { module, test } = QUnit;

module('Torii');

test('exists', function(assert){
  assert.ok(Torii);
});
