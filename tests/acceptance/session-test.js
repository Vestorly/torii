import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import DummyAdapter from '../helpers/dummy-adapter';
import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';

function signIn(session, sessionData={}){
  var sm = session.get('stateMachine');
  sm.send('startOpen');
  sm.send('finishOpen', sessionData);
}

module('Acceptance | Session', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.torii   = this.owner.lookup("service:torii");
    this.session = this.owner.lookup("service:session");
    this.adapter = this.owner.lookup("torii-adapter:application");

    this.owner.register('torii-provider:dummy-failure', DummyFailureProvider);
    this.owner.register('torii-provider:dummy-success', DummySuccessProvider);
  });

  test("#open dummy-success session raises must-implement on application adapter", function(assert){
    return this.session.open('dummy-success').then(() => {
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });

  test("#open dummy-success session fails on signed in state", function(assert){
    signIn(this.session);

    return this.session.open('dummy-success').then(() => {
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });

  test("#open dummy-success session successfully opens", function(assert){
    this.owner.register("torii-adapter:dummy-success", DummyAdapter);

    return this.session.open('dummy-success').then(() => {
      assert.ok(true, 'resolves promise');
      assert.ok(this.session.get('isAuthenticated'), 'authenticated');
      assert.ok(this.session.get('currentUser.email'), 'user has email');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });

  test("#open dummy-failure session fails to open", function(assert){
    return this.session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'fails to resolve promise');
    });
  });

  test("#fetch dummy-success session raises must-implement on application adapter", function(assert){
    return this.session.fetch('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });

  test("#fetch dummy-success session fails on signed in state", function(assert){
    this.owner.register("torii-adapter:dummy-success", DummyAdapter);
    signIn(this.session);

    return this.session.fetch('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });

  test("#fetch dummy-success session successfully opens", function(assert){
    this.owner.register("torii-adapter:dummy-success", DummyAdapter);

    return this.session.fetch('dummy-success').then(() => {
      assert.ok(true, 'resolves promise');
      assert.ok(this.session.get('isAuthenticated'), 'authenticated');
      assert.ok(this.session.get('currentUser.email'), 'user has email');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });

  test("#fetch session passes options to adapter", function(assert){
    var adapterFetchCalledWith = null;
    var opts = {};

    this.owner.register("torii-adapter:dummy-success", DummyAdapter.extend({
      fetch(options) {
        adapterFetchCalledWith = options;
        return this._super(options);
      }
    }));

    return this.session.fetch('dummy-success', opts).then(function(){
      assert.equal(adapterFetchCalledWith, opts, 'options should be passed through to adapter');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });

  test("#fetch dummy-failure session fails to open", function(assert){
    return this.session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'fails to resolve promise');
    });
  });

  test("#close dummy-success fails in an unauthenticated state", function(assert){
    this.adapter.reopen({
      async close() {}
    });

    return this.session.close().then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });

  test("#close dummy-success session closes", function(assert){
    signIn(this.session, {currentUser: {email: 'some@email.com'}});

    this.adapter.reopen({
      async close() {}
    });

    return this.session.close('dummy-success').then(() => {
      assert.ok(true, 'resolved promise');
      assert.ok(!this.session.get('isAuthenticated'), 'authenticated');
      assert.ok(!this.session.get('currentUser.email'), 'user has email');
    }, function(){
      assert.ok(false, 'fails promise');
    });
  });

  test("#close dummy-success session raises must-implement on application adapter", function(assert){
    signIn(this.session);

    return this.session.close('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });

  test("#close dummy-success session passes options to application adapter", function(assert){
    var optionsCloseCalledWith = null;
    var opts = {};

    signIn(this.session, {currentUser: {email: 'some@email.com'}});

    this.adapter.close = async function(options) {
      optionsCloseCalledWith = options;
    };

    return this.session.close('dummy-success', opts).then(function(){
      assert.equal(optionsCloseCalledWith, opts, 'options should be passed through to adapter');
    });
  });

  test("#close dummy-success session uses named adapter when present", function(assert){
    signIn(this.session, {currentUser: {email: 'some@email.com'}});
    var correctAdapterCalled = false;
    this.owner.register("torii-adapter:dummy-success", DummyAdapter.extend({
      close() {
        correctAdapterCalled = true;
        return this._super();
      }
    }));

    return this.session.close('dummy-success').then(function(){
      assert.ok(correctAdapterCalled, 'named adapter should be used');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});
