import Provider from '../../helpers/dummy-failure-provider';
import { module, test } from 'qunit';

module('Unit | Provider | DummyFailureProvider', function(/*hooks*/) {
  test("Provider rejects on open", function(assert){
    const provider = Provider.create();

    return provider.open().then(function(){
      assert.ok(false, 'dummy-success fulfilled an open promise');
    }, function(){
      assert.ok(true, 'dummy-success fails to resolve an open promise');
    });
  });
});

