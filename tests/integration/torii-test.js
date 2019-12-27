import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';

module('Integration | Torii', function(hooks) {
  let torii;

  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('torii-provider:dummy-success', DummySuccessProvider);
    this.owner.register('torii-provider:dummy-failure', DummyFailureProvider);
    torii = this.owner.lookup('service:torii');
  });

  test("torii opens a dummy-success provider", function(assert){
    return torii.open('dummy-success', {name: 'dummy'}).then(function(authentication){
      assert.ok(true, 'torii resolves an open promise');
      assert.equal(authentication.name, 'dummy', 'resolves with an authentication object');
    }, function(){
      assert.ok(false, 'torii failed to resolve an open promise');
    });
  });

  test("torii fails to open a dummy-failure provider", function(assert){
    return torii.open('dummy-failure').then(function(){
      assert.ok(false, 'torii resolved an open promise');
    }, function(){
      assert.ok(true, 'torii rejected a failed open');
    });
  });

  test("torii fetches a dummy-success provider", function(assert){
    this.owner.register('torii-provider:with-fetch', DummySuccessProvider.extend({
      fetch: async () => {}
    }));

    return torii.open('with-fetch', {name: 'dummy'}).then(function(){
      assert.ok(true, 'torii resolves a fetch promise');
    }, function(){
      assert.ok(false, 'torii failed to resolve an fetch promise');
    });
  });

  test("torii fails to fetch a dummy-failure provider", function(assert){
    this.owner.register('torii-provider:with-fetch', DummyFailureProvider.extend({
      fetch: async () => {}
    }));

    return torii.open('with-fetch').then(function(){
      assert.ok(false, 'torii resolve a fetch promise');
    }, function(){
      assert.ok(true, 'torii rejected a failed fetch');
    });
  });

  test("torii closes a dummy-success provider", function(assert){
    this.owner.register('torii-provider:with-close', DummySuccessProvider.extend({
      fetch: async () => {}
    }));

    return torii.open('with-close', {name: 'dummy'}).then(function(){
      assert.ok(true, 'torii resolves a clos promise');
    }, function(){
      assert.ok(false, 'torii failed to resolves a close promise');
    });
  });

  test("torii fails to close a dummy-failure provider", function(assert){
    this.owner.register('torii-provider:with-close', DummyFailureProvider.extend({
      fetch: async () => {}
    }));

    return torii.open('with-close').then(function(){
      assert.ok(false, 'torii resolves a close promise');
    }, function(){
      assert.ok(true, 'torii rejected a close open');
    });
  });

  test('raises on a bad provider name', function(assert){
    let thrown = false;
    let message;

    try {
      torii.open('bs-man');
    } catch (e) {
      thrown = true;
      message = e.message;
    }

    assert.ok(thrown, "Error thrown");
    assert.ok(/Expected a provider named 'bs-man'/.test(message),
       'correct error thrown');
  });

  test('raises when calling undefined #open', function(assert){
    this.owner.register('torii-provider:without-open', DummyFailureProvider.extend({
      open: null
    }));

    let thrown = false
    let message;

    try {
      torii.open('without-open');
    } catch (e) {
      thrown = true;
      message = e.message;
    }

    assert.ok(thrown, "Error thrown");
    assert.ok(/Expected provider 'without-open' to define the 'open' method/.test(message), 'correct error thrown. was "'+message+'"');
  });

  test('fails silently when calling undefined #fetch', function(assert){
    return torii.fetch('dummy-failure').then(function(){
      assert.ok(true, "Promise for fetch resolves");
    }).catch(() => {
      assert.ok(false, "Error thrown");
    });
  });

  test('fails silently when calling undefined #close', function(assert){
    return torii.close('dummy-failure').then(function() {
      assert.ok(true, "Promise for close resolves");
    }).catch(function() {
      assert.ok(false, "Error thrown");
    });
  });
});
