import RedirectHandler from 'torii/redirect-handler';
import { CURRENT_REQUEST_KEY } from 'torii/mixins/ui-service-mixin';

function buildMockWindow(windowName, url){
  return {
    name: windowName,
    location: {
      toString: function(){
        return url;
      }
    },
    localStorage: {
      setItem: function() {},
      getItem: function() {},
      removeItem: function() {}
    },
    close: Ember.K
  };
}

module('RedirectHandler - Unit');

test('exists', function(){
  ok(RedirectHandler);
});

test("handles a tori-popup window with a current request key in localStorage and url", function(){
  expect(2);

  var keyForReturn = 'some-key';
  var url = 'http://authServer?code=1234512345fw';

  var mockWindow = buildMockWindow("torii-popup:abc123", url);
  mockWindow.localStorage.getItem = function(key) {
    if (key === CURRENT_REQUEST_KEY) {
      return keyForReturn;
    }
  }
  mockWindow.localStorage.setItem = function(key, val) {
    if (key === keyForReturn) {
      equal(val, url, 'url is set for parent window');
    }
  }
  var handler = new RedirectHandler(mockWindow);

  Ember.run(function(){
    handler.run().then(function(){}, function(error){
      ok(false, "run handler rejected a basic url");
    });
  });

  ok(!handler.isFulfilled, "hangs the return promise forever");
});

test('rejects the promise if there is no request key', function(){

  var mockWindow = buildMockWindow("", "http://authServer?code=1234512345fw");
  var handler = new RedirectHandler(mockWindow);

  Ember.run(function(){
    handler.run().then(function(){
      ok(false, "run handler succeeded on a url");
    }, function(error){
      ok(true, "run handler rejects a url without data");
    });
  });
});

test('does not set local storage when not a torii popup', function(){
  expect(1);
  var mockWindow = buildMockWindow("", "http://authServer?code=1234512345fw");
  mockWindow.localStorage.setItem = function(key, value) {
    ok(false, "storage was set unexpectedly");
  }

  var handler = new RedirectHandler(mockWindow);

  Ember.run(function(){
    handler.run().then(function(){
      ok(false, "run handler succeeded on a popup");
    }, function(error){
      ok(true, "run handler rejects a popup without a name");
    });
  });
});

test('closes the window when a torii popup with request', function(){
  expect(1);

  var mockWindow = buildMockWindow("torii-popup:abc123", "http://authServer?code=1234512345fw");
  mockWindow.localStorage.getItem = function(key) {
    if (key === CURRENT_REQUEST_KEY) {
      return 'some-key';
    }
  }

  var handler = new RedirectHandler(mockWindow);

  mockWindow.close = function(){
    ok(true, "Window was closed");
  };

  Ember.run(function(){
    handler.run();
  });
});

test('does not close the window when a not torii popup', function(){
  expect(1);

  var mockWindow = buildMockWindow("", "http://authServer?code=1234512345fw");

  var handler = new RedirectHandler(mockWindow);

  mockWindow.close = function(){
    ok(false, "Window was closed unexpectedly");
  };

  Ember.run(function(){
    handler.run().then(function(){}, function(error){
      ok(true, "error handler is called");
    });
  });
});
