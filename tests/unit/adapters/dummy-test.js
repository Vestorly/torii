import DummyAdapter from '../../helpers/dummy-adapter';
import QUnit from 'qunit';
let { module, test } = QUnit;

var adapter;

module("DummyAdapter - Unit", {
  setup: function(){
    adapter = DummyAdapter.create();
  },
  teardown: function() {
    Ember.run(adapter, 'destroy');
  }
});

test("open resolves with a user", function(assert){
  Ember.run(function(){
    adapter.open().then(function(data){
      assert.ok(true, 'resolved');
      assert.ok(Ember.get(data,'currentUser.email'), 'dummy user has email');
    });
  });
});
