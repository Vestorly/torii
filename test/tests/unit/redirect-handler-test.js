import RedirectHandler from 'torii/redirect-handler';

var originalPostMessage = window.postMessage;

module('RedirectHandler - Unit', {
  setup: function(){
    window.name = 'torii-auth';
    window.opener = {postMessage: Ember.K};
  },
  teardown: function(){
    window.name = null;
    window.opener = null;
  }
});

test('exists', function(){
  ok(RedirectHandler);
});

test('handles a url', function(){
  var url = "http://authServer?code=123451235fw";
  var handler = new RedirectHandler(url);

  Ember.run(function(){
    handler.run().then(function(){}, function(error){
      ok(false, "run handler rejected a basic url");
    });
  });

  ok(!handler.isFulfilled, "hangs the return promise forever");
});

test('rejects a url', function(){
  window.opener = null;

  var url = "http://authServer";
  var handler = new RedirectHandler(url);

  Ember.run(function(){
    handler.run().then(function(){
      ok(false, "run handler succeeded on a url");
    }, function(error){
      ok(true, "run handler rejects a url without data");
    });
  });
});

test('does not post a message', function(){
  expect(1);

  var url = "http://authServer";
  var handler = new RedirectHandler(url);

  window.name = null;
  window.opener = {
    postMessage: function(message, origin){
      ok(false, "message was received");
    }
  };

  Ember.run(function(){
    handler.run().then(function(){
      ok(false, "run handler succeeded on a popup");
    }, function(error){
      ok(true, "run handler rejects a popup without a name");
    });
  });
});

test('posts a message', function(){
  expect(1);

  var code = "d29f2jf20j",
      url = "http://authServer?code="+code,
      handler = new RedirectHandler(url);

  window.name = 'torii-auth';
  window.opener = {
    postMessage: function(message, origin){
      equal(message, "__torii_message:"+url, "posts back the url");
    }
  };

  Ember.run(function(){
    handler.run();
  });
});
