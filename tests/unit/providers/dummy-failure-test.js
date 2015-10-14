var provider;

import Provider from '../../helpers/dummy-failure-provider';
import QUnit from 'qunit';

let { module, test } = QUnit;

module('DummyFailureProvider - Unit', {
  setup: function(){
    provider = Provider.create();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
  }
});

test("Provider rejects on open", function(assert){
  Ember.run(function(){
    provider.open().then(function(){
      assert.ok(false, 'dummy-success fulfilled an open promise');
    }, function(){
      assert.ok(true, 'dummy-success fails to resolve an open promise');
    });
  });
});
