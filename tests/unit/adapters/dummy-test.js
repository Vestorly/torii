import { get } from '@ember/object';
import { run } from '@ember/runloop';
import DummyAdapter from '../../helpers/dummy-adapter';
import QUnit from 'qunit';
let { module, test } = QUnit;

var adapter;

module('Unit | Adapter | DummyAdapter', {
  beforeEach() {
    adapter = DummyAdapter.create();
  },
  afterEach() {
    run(adapter, 'destroy');
  }
});

test("open resolves with a user", function(assert){
  run(function(){
    adapter.open().then(function(data){
      assert.ok(true, 'resolved');
      assert.ok(get(data,'currentUser.email'), 'dummy user has email');
    });
  });
});
