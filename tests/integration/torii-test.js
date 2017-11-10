var torii, app;

import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';
import startApp from '../helpers/start-app';
import lookup from '../helpers/lookup';
import QUnit from 'qunit';

let { module, test } = QUnit;

module('Integration | Torii', {
  beforeEach() {
    app = startApp({loadInitializers: true});
    app.register('torii-provider:dummy-success', DummySuccessProvider);
    app.register('torii-provider:dummy-failure', DummyFailureProvider);
    torii = lookup(app, 'service:torii');
  },
  afterEach() {
    Ember.run(app, 'destroy');
  }
});

test("torii opens a dummy-success provider", function(assert){
  Ember.run(function(){
    torii.open('dummy-success', {name: 'dummy'}).then(function(authentication){
      assert.ok(true, 'torii resolves an open promise');
      assert.equal(authentication.name, 'dummy', 'resolves with an authentication object');
    }, function(){
      assert.ok(false, 'torii failed to resolve an open promise');
    });
  });
});

test("torii fails to open a dummy-failure provider", function(assert){
  Ember.run(function(){
    torii.open('dummy-failure').then(function(){
      assert.ok(false, 'torii resolved an open promise');
    }, function(){
      assert.ok(true, 'torii rejected a failed open');
    });
  });
});

test("torii fetches a dummy-success provider", function(assert){
  app.register('torii-provider:with-fetch', DummySuccessProvider.extend({
    fetch: Ember.RSVP.Promise.resolve
  }));
  Ember.run(function(){
    torii.open('with-fetch', {name: 'dummy'}).then(function(){
      assert.ok(true, 'torii resolves a fetch promise');
    }, function(){
      assert.ok(false, 'torii failed to resolve an fetch promise');
    });
  });
});

test("torii fails to fetch a dummy-failure provider", function(assert){
  app.register('torii-provider:with-fetch', DummyFailureProvider.extend({
    fetch: Ember.RSVP.Promise.reject
  }));
  Ember.run(function(){
    torii.open('with-fetch').then(function(){
      assert.ok(false, 'torii resolve a fetch promise');
    }, function(){
      assert.ok(true, 'torii rejected a failed fetch');
    });
  });
});

test("torii closes a dummy-success provider", function(assert){
  app.register('torii-provider:with-close', DummySuccessProvider.extend({
    fetch: Ember.RSVP.Promise.resolve
  }));
  Ember.run(function(){
    torii.open('with-close', {name: 'dummy'}).then(function(){
      assert.ok(true, 'torii resolves a clos promise');
    }, function(){
      assert.ok(false, 'torii failed to resolves a close promise');
    });
  });
});

test("torii fails to close a dummy-failure provider", function(assert){
  app.register('torii-provider:with-close', DummyFailureProvider.extend({
    fetch: Ember.RSVP.Promise.reject
  }));
  Ember.run(function(){
    torii.open('with-close').then(function(){
      assert.ok(false, 'torii resolves a close promise');
    }, function(){
      assert.ok(true, 'torii rejected a close open');
    });
  });
});

test('raises on a bad provider name', function(assert){
  var thrown = false, message;
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
  app.register('torii-provider:without-open', DummyFailureProvider.extend({
    open: null
  }));
  var thrown = false, message;
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
  var thrown = false, fetched;
  try {
    Ember.run(function(){
      torii.fetch('dummy-failure').then(function(){
        fetched = true;
      });
    });
  } catch (e) {
    thrown = true;
  }
  assert.ok(!thrown, "Error not thrown");
  assert.ok(fetched, "Promise for fetch resolves");
});

test('fails silently when calling undefined #close', function(assert){
  var thrown = false, closed;
  try {
    Ember.run(function(){
      torii.close('dummy-failure').then(function(){
        closed = true;
      });
    });
  } catch (e) {
    thrown = true;
  }
  assert.ok(!thrown, "Error not thrown");
  assert.ok(closed, "Promise for close resolves");
});

