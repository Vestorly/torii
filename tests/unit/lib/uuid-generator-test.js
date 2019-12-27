import UUIDGenerator from 'torii/lib/uuid-generator';
import { module, test } from 'qunit';

module('Unit | Lib | UUIDGenerator', function(/*hooks*/) {
  test('exists', function(assert){
    assert.ok(UUIDGenerator);
  });

  test('.generate returns a new uuid each time', function(assert){
    const first = UUIDGenerator.generate();
    const second = UUIDGenerator.generate();

    assert.notEqual(first, second);
  });
});
