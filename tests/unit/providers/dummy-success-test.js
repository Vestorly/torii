var provider;

import Provider from '../../helpers/dummy-success-provider';
import QUnit from 'qunit';

let { module, test } = QUnit;

module('DummySuccessProvider - Unit', {
  setup: function(){
    provider = Provider.create();
  },
  teardown: function(){
    Ember.run(provider, 'destroy');
  }
});

test("Provider fulfills on open", function(assert){
  Ember.run(function(){
    provider.open().then(function(){
      assert.ok(true, 'dummy-success resolves an open promise');
    }, function(){
      assert.ok(false, 'dummy-success failed to resolves an open promise');
    });
  });
});
