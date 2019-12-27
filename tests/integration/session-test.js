import { setupTest } from 'ember-qunit';

import SessionService from 'torii/services/torii-session';
import DummyAdapter from '../helpers/dummy-adapter';
import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';
import { module, test } from 'qunit';


module('Integration | Session (open)', function(hooks) {
  let session;

  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:session', SessionService);
    this.owner.register('torii-provider:dummy-success', DummySuccessProvider);
    this.owner.register('torii-provider:dummy-failure', DummyFailureProvider);
    this.owner.inject('service:session', 'torii', 'service:torii');

    session = this.owner.lookup('service:session');
  });

  test("session starts in unauthenticated unopened state", function(assert){
    assert.ok(!session.get('isOpening'), 'not opening');
    assert.ok(!session.get('isAuthenticated'), 'not authenticated');
  });

  test("starting auth sets isOpening to true", function(assert){
    const provider = this.owner.lookup('torii-provider:dummy-success');
    var oldOpen = provider.open;

    provider.open = function(){
      assert.ok(true, 'calls provider.open');
      assert.ok(session.get('isOpening'), 'session.isOpening is true');

      return oldOpen.apply(this, arguments);
    };

    this.owner.register("torii-adapter:dummy-success", DummyAdapter);

    return session.open('dummy-success');
  });

  test("successful auth sets isAuthenticated to true", function(assert){
    this.owner.register("torii-adapter:dummy-success", DummyAdapter);

    return session.open('dummy-success').then(function(){
      assert.ok(!session.get('isOpening'), 'session is no longer opening');
      assert.ok(session.get('isAuthenticated'), 'session is authenticated');
    });
  });

  test("failed auth sets isAuthenticated to false, sets error", function(assert){
    return session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'rejects promise');
      assert.ok(!session.get('isOpening'), 'session is no longer opening');
      assert.ok(!session.get('isAuthenticated'), 'session is not authenticated');
      assert.ok(session.get('errorMessage'), 'session has error message');
    });
  });
});


module('Integration | Session (close) ', function(hooks) {
  let session, user, adapter;

  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('service:session', SessionService);
    this.owner.inject('service:session', 'torii', 'service:torii');
    session = this.owner.lookup('service:session');
    adapter = this.owner.lookup('torii-adapter:application');

    // Put the session in an open state
    user = {email: 'fake@fake.com'};
    session.get('stateMachine').transitionTo('opening');
    session.get('stateMachine').send('finishOpen', { currentUser: user});
  });

  test("session starts in authenticated opened state", function(assert){
    assert.ok(session.get('isAuthenticated'), 'not authenticated');
    assert.deepEqual(session.get('currentUser'), user, 'has currentUser');
  });

  test("starting close sets isWorking to true", function(assert){
    adapter.close = async function(){
      assert.ok(true, 'calls adapter.close');
      assert.ok(session.get('isWorking'), 'session.isWorking is true');
    };

    return session.close();
  });

  test("finished close sets isWorking to false, isAuthenticated false", function(assert){
    adapter.close = async function() {};

    return session.close().then(function(){
      assert.ok(!session.get('isWorking'), "isWorking is false");
      assert.ok(!session.get('isAuthenticated'), "isAuthenticated is false");
      assert.ok(!session.get('currentUser'), "currentUser is false");
    }, function(err){
      assert.ok(false, "promise rejected with error: "+err);
    });
  });

  test("failed close sets isWorking to false, isAuthenticated true, error", function(assert){
    var error = 'Oh my';

    adapter.close = async function(){ throw error };

    return session.close().then(function(){
      assert.ok(false, "promise resolved");
    },function(error){
      assert.ok(!session.get('isWorking'), "isWorking is false");
      assert.ok(!session.get('isAuthenticated'), "isAuthenticated is true");
      assert.equal(session.get('errorMessage'), error, "error is present");
    });
  });
});
