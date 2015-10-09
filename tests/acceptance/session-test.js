import startApp from '../helpers/start-app';
import DummyAdapter from '../helpers/dummy-adapter';
import DummySuccessProvider from '../helpers/dummy-success-provider';
import DummyFailureProvider from '../helpers/dummy-failure-provider';
import QUnit from 'qunit';
import Ember from 'ember';

let { module, test } = QUnit;

var torii, app, session, container, adapter;

function signIn(sessionData){
  var sm = session.get('stateMachine');
  sm.send('startOpen');
  sm.send('finishOpen', sessionData || {});
}

module('Session - Acceptance', {
  setup: function(){
    app = startApp();
    container = app.__container__;
    torii   = container.lookup("service:torii");
    session = container.lookup("service:session");
    adapter = container.lookup("torii-adapter:application");

    app.register('torii-provider:dummy-failure', DummyFailureProvider);
    app.register('torii-provider:dummy-success', DummySuccessProvider);
  },
  teardown: function(){
    Ember.run(app, 'destroy');
  }
});

test("#open dummy-success session raises must-implement on application adapter", function(assert){
  Ember.run(function(){
    session.open('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });
});

test("#open dummy-success session fails on signed in state", function(assert){
  signIn();
  Ember.run(function(){
    session.open('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });
});

test("#open dummy-success session successfully opens", function(assert){
  app.register("torii-adapter:dummy-success", DummyAdapter);
  Ember.run(function(){
    session.open('dummy-success').then(function(){
      assert.ok(true, 'resolves promise');
      assert.ok(session.get('isAuthenticated'), 'authenticated');
      assert.ok(session.get('currentUser.email'), 'user has email');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});

test("#open dummy-failure session fails to open", function(assert){
  Ember.run(function(){
    session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'fails to resolve promise');
    });
  });
});

test("#fetch dummy-success session raises must-implement on application adapter", function(assert){
  Ember.run(function(){
    session.fetch('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });
});

test("#fetch dummy-success session fails on signed in state", function(assert){
  app.register("torii-adapter:dummy-success", DummyAdapter);
  signIn();
  Ember.run(function(){
    session.fetch('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });
});

test("#fetch dummy-success session successfully opens", function(assert){
  app.register("torii-adapter:dummy-success", DummyAdapter);
  Ember.run(function(){
    session.fetch('dummy-success').then(function(){
      assert.ok(true, 'resolves promise');
      assert.ok(session.get('isAuthenticated'), 'authenticated');
      assert.ok(session.get('currentUser.email'), 'user has email');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});

test("#fetch session passes options to adapter", function(assert){
  var adapterFetchCalledWith = null;
  app.register("torii-adapter:dummy-success", DummyAdapter.extend({
    fetch: function(options){
      adapterFetchCalledWith = options;
      return this._super(options);
    }
  }));
  Ember.run(function(){
    var opts = {};
    session.fetch('dummy-success', opts).then(function(){
      assert.equal(adapterFetchCalledWith, opts, 'options should be passed through to adapter');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});

test("#fetch dummy-failure session fails to open", function(assert){
  Ember.run(function(){
    session.open('dummy-failure').then(function(){
      assert.ok(false, 'should not resolve promise');
    }, function(){
      assert.ok(true, 'fails to resolve promise');
    });
  });
});

test("#close dummy-success fails in an unauthenticated state", function(assert){
  adapter.reopen({
    close: function(){
      return Ember.RSVP.Promise.resolve();
    }
  });
  Ember.run(function(){
    session.close().then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/Unknown Event/), 'fails with message');
    });
  });
});

test("#close dummy-success session closes", function(assert){
  signIn({currentUser: {email: 'some@email.com'}});
  adapter.reopen({
    close: function(){
      return Ember.RSVP.Promise.resolve();
    }
  });
  Ember.run(function(){
    session.close('dummy-success').then(function(){
      assert.ok(true, 'resolved promise');
      assert.ok(!session.get('isAuthenticated'), 'authenticated');
      assert.ok(!session.get('currentUser.email'), 'user has email');
    }, function(){
      assert.ok(false, 'fails promise');
    });
  });
});

test("#close dummy-success session raises must-implement on application adapter", function(assert){
  signIn();
  Ember.run(function(){
    session.close('dummy-success').then(function(){
      assert.ok(false, 'resolved promise');
    }, function(error){
      assert.ok(true, 'fails promise');
      assert.ok(error.message.match(/must implement/), 'fails with message to implement');
    });
  });
});

test("#close dummy-success session passes options to application adapter", function(assert){
  signIn({currentUser: {email: 'some@email.com'}});
  var optionsCloseCalledWith = null;

  adapter.close = function(options) {
    optionsCloseCalledWith = options;
    return new Ember.RSVP.Promise(function (resolve) { resolve(); });
  };

  Ember.run(function(){
    var opts = {};
    session.close('dummy-success', opts).then(function(){
      assert.equal(optionsCloseCalledWith, opts, 'options should be passed through to adapter');
    });
  });
});

test("#close dummy-success session uses named adapter when present", function(assert){
  signIn({currentUser: {email: 'some@email.com'}});
  var correctAdapterCalled = false;
  app.register("torii-adapter:dummy-success", DummyAdapter.extend({
    close: function() {
      correctAdapterCalled = true;
      return this._super();
    }
  }));
  Ember.run(function(){
    session.close('dummy-success').then(function(){
      assert.ok(correctAdapterCalled, 'named adapter should be used');
    }, function(err){
      assert.ok(false, 'failed to resolve promise: '+err);
    });
  });
});
