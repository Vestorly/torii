import DummyAdapter from '../../helpers/dummy-adapter';
import { module, test } from 'qunit';

module('Unit | Adapter | DummyAdapter', function(hooks) {
  hooks.beforeEach(function() {
  });

  test("open resolves with a user", function(assert){
    const adapter = DummyAdapter.create();

    return adapter.open().then(function(data){
      assert.ok(true, 'resolved');
      assert.ok(data.currentUser.email, 'dummy user has email');
    });
  });
});
