import { run } from '@ember/runloop';
var provider;

import Provider from '../../helpers/dummy-success-provider';
import QUnit from 'qunit';

let { module, test } = QUnit;

module('Unit | Provider | DummySuccessProvider', {
  beforeEach() {
    provider = Provider.create();
  },
  afterEach() {
    run(provider, 'destroy');
  }
});

test("Provider fulfills on open", function(assert){
  run(function(){
    provider.open().then(function(){
      assert.ok(true, 'dummy-success resolves an open promise');
    }, function(){
      assert.ok(false, 'dummy-success failed to resolves an open promise');
    });
  });
});
