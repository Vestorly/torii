var session, user, adapter, app;

import SessionService from 'torii/services/torii-session';
import DummyAdapter from '../helpers/dummy-adapter';
import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';
import startApp from '../helpers/start-app';
import lookup from '../helpers/lookup';
import QUnit from 'qunit';


const { module, test } = QUnit;

module('Session (open) - Integration', {
  beforeEach() {
    app = startApp({loadInitializers: true});
    app.register('service:session', SessionService);
    app.register('torii-provider:dummy-success', DummySuccessProvider);
    app.register('torii-provider:dummy-failure', DummyFailureProvider);
    app.inject('service:session', 'torii', 'service:torii');
    session = lookup(app, 'service:session');
  },
  afterEach() {
    Ember.run(app, 'destroy');
  }
});

test("session starts in unauthenticated unopened state", function(assert){
  assert.ok(!session.get('isOpening'), 'not opening');
  assert.ok(!session.get('isAuthenticated'), 'not authenticated');
});

test("starting auth sets isOpening to true", function(assert){
  var provider = lookup(app, 'torii-provider:dummy-success');
  var oldOpen = provider.open;

  provider.open = function(){
    assert.ok(true, 'calls provider.open');
    assert.ok(session.get('isOpening'), 'session.isOpening is true');

    return oldOpen.apply(this, arguments);
  };

  app.register("torii-adapter:dummy-success", DummyAdapter);
  Ember.run(function(){
    session.open('dummy-success');
  });
});

test("successful auth sets isAuthenticated to true", function(assert){
  app.register("torii-adapter:dummy-success", DummyAdapter);
  Ember.run(function(){
    session.open('dummy-success').then(function(){
      assert.ok(!session.get('isOpening'), 'session is no longer opening');
      assert.ok(session.get('isAuthenticated'), 'session is authenticated');
    });
  });
});

test("failed auth sets isAuthenticated to false, sets error", function(assert){
  Ember.run(function(){
    session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'rejects promise');

      assert.ok(!session.get('isOpening'), 'session is no longer opening');
      assert.ok(!session.get('isAuthenticated'), 'session is not authenticated');
      assert.ok(session.get('errorMessage'), 'session has error message');
    });
  });
});

module('Session (close) - Integration', {
  beforeEach() {
    app = startApp({loadInitializers: true});
    app.register('service:session', SessionService);
    app.inject('service:session', 'torii', 'service:torii');
    session = lookup(app, 'service:session');
    adapter = lookup(app, 'torii-adapter:application');

    // Put the session in an open state
    user = {email: 'fake@fake.com'};
    session.get('stateMachine').transitionTo('opening');
    session.get('stateMachine').send('finishOpen', { currentUser: user});
  },
  afterEach() {
    Ember.run(app, 'destroy');
  }
});

test("session starts in authenticated opened state", function(assert){
  assert.ok(session.get('isAuthenticated'), 'not authenticated');
  assert.deepEqual(session.get('currentUser'), user, 'has currentUser');
});

test("starting close sets isWorking to true", function(assert){
  adapter.close = function(){
    assert.ok(true, 'calls adapter.close');
    assert.ok(session.get('isWorking'), 'session.isWorking is true');
    return Ember.RSVP.resolve();
  };

  Ember.run(function(){
    session.close();
  });
});

test("finished close sets isWorking to false, isAuthenticated false", function(assert){
  adapter.close = function(){
    return Ember.RSVP.resolve();
  };

  Ember.run(function(){
    session.close().then(function(){
      assert.ok(!session.get('isWorking'), "isWorking is false");
      assert.ok(!session.get('isAuthenticated'), "isAuthenticated is false");
      assert.ok(!session.get('currentUser'), "currentUser is false");
    }, function(err){
      assert.ok(false, "promise rejected with error: "+err);
    });
  });
});

test("failed close sets isWorking to false, isAuthenticated true, error", function(assert){
  var error = 'Oh my';

  adapter.close = function(){
    return Ember.RSVP.reject(error);
  };

  Ember.run(function(){
    session.close().then(function(){
      assert.ok(false, "promise resolved");
    },function(error){
      assert.ok(!session.get('isWorking'), "isWorking is false");
      assert.ok(!session.get('isAuthenticated'), "isAuthenticated is true");
      assert.equal(session.get('errorMessage'), error, "error is present");
    });
  });
});
