import Provider from '../../helpers/dummy-success-provider';
import { module, test } from 'qunit';

module('Unit | Provider | DummySuccessProvider', function(/*hooks*/) {
  test("Provider fulfills on open", function(assert){
    const provider = Provider.create();

    return provider.open().then(function(){
      assert.ok(true, 'dummy-success resolves an open promise');
    }, function(){
      assert.ok(false, 'dummy-success failed to resolves an open promise');
    });
  });
});
