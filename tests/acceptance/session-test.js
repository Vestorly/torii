import { Promise as EmberPromise } from 'rsvp';
import { run } from '@ember/runloop';
import DummyAdapter from '../helpers/dummy-adapter';
import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { test } from 'qunit';

function signIn(session, sessionData={}){
  var sm = session.get('stateMachine');
  sm.send('startOpen');
  sm.send('finishOpen', sessionData);
}

moduleForAcceptance('Acceptance | Session', {
  beforeEach() {
    this.container = this.application.__container__;
    this.torii   = this.container.lookup("service:torii");
    this.session = this.container.lookup("service:session");
    this.adapter = this.container.lookup("torii-adapter:application");

    this.application.register('torii-provider:dummy-failure', DummyFailureProvider);
    this.application.register('torii-provider:dummy-success', DummySuccessProvider);
  }
});

test("#open dummy-success session raises must-implement on application adapter", function(assert){
  run(() => {
    this.session.open('dummy-success').then(() => {
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });
});

test("#open dummy-success session fails on signed in state", function(assert){
  signIn(this.session);
  run(() => {
    this.session.open('dummy-success').then(() => {
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });
});

test("#open dummy-success session successfully opens", function(assert){
  this.application.register("torii-adapter:dummy-success", DummyAdapter);
  run(() => {
    this.session.open('dummy-success').then(() => {
      assert.ok(true, 'resolves promise');
      assert.ok(this.session.get('isAuthenticated'), 'authenticated');
      assert.ok(this.session.get('currentUser.email'), 'user has email');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});

test("#open dummy-failure session fails to open", function(assert){
  run(() => {
    this.session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'fails to resolve promise');
    });
  });
});

test("#fetch dummy-success session raises must-implement on application adapter", function(assert){
  run(() => {
    this.session.fetch('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });
});

test("#fetch dummy-success session fails on signed in state", function(assert){
  this.application.register("torii-adapter:dummy-success", DummyAdapter);
  signIn(this.session);
  run(() => {
    this.session.fetch('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });
});

test("#fetch dummy-success session successfully opens", function(assert){
  this.application.register("torii-adapter:dummy-success", DummyAdapter);
  run(() => {
    this.session.fetch('dummy-success').then(() => {
      assert.ok(true, 'resolves promise');
      assert.ok(this.session.get('isAuthenticated'), 'authenticated');
      assert.ok(this.session.get('currentUser.email'), 'user has email');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});

test("#fetch session passes options to adapter", function(assert){
  var adapterFetchCalledWith = null;
  this.application.register("torii-adapter:dummy-success", DummyAdapter.extend({
    fetch(options) {
      adapterFetchCalledWith = options;
      return this._super(options);
    }
  }));
  run(() => {
    var opts = {};
    this.session.fetch('dummy-success', opts).then(function(){
      assert.equal(adapterFetchCalledWith, opts, 'options should be passed through to adapter');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});

test("#fetch dummy-failure session fails to open", function(assert){
  run(() => {
    this.session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'fails to resolve promise');
    });
  });
});

test("#close dummy-success fails in an unauthenticated state", function(assert){
  this.adapter.reopen({
    close() {
      return EmberPromise.resolve();
    }
  });
  run(() => {
    this.session.close().then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });
});

test("#close dummy-success session closes", function(assert){
  signIn(this.session, {currentUser: {email: 'some@email.com'}});
  this.adapter.reopen({
    close() {
      return EmberPromise.resolve();
    }
  });
  run(() => {
    this.session.close('dummy-success').then(() => {
      assert.ok(true, 'resolved promise');
      assert.ok(!this.session.get('isAuthenticated'), 'authenticated');
      assert.ok(!this.session.get('currentUser.email'), 'user has email');
    }, function(){
      assert.ok(false, 'fails promise');
    });
  });
});

test("#close dummy-success session raises must-implement on application adapter", function(assert){
  signIn(this.session);
  run(() => {
    this.session.close('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });
});

test("#close dummy-success session passes options to application adapter", function(assert){
  signIn(this.session, {currentUser: {email: 'some@email.com'}});
  var optionsCloseCalledWith = null;

  this.adapter.close = function(options) {
    optionsCloseCalledWith = options;
    return new EmberPromise(function (resolve) { resolve(); });
  };

  run(() => {
    var opts = {};
    this.session.close('dummy-success', opts).then(function(){
      assert.equal(optionsCloseCalledWith, opts, 'options should be passed through to adapter');
    });
  });
});

test("#close dummy-success session uses named adapter when present", function(assert){
  signIn(this.session, {currentUser: {email: 'some@email.com'}});
  var correctAdapterCalled = false;
  this.application.register("torii-adapter:dummy-success", DummyAdapter.extend({
    close() {
      correctAdapterCalled = true;
      return this._super();
    }
  }));
  run(() => {
    this.session.close('dummy-success').then(function(){
      assert.ok(correctAdapterCalled, 'named adapter should be used');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});
