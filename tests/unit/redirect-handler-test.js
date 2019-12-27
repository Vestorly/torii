import { run } from '@ember/runloop';
import RedirectHandler from 'torii/redirect-handler';
import { CURRENT_REQUEST_KEY } from 'torii/mixins/ui-service-mixin';
import { module, test } from 'qunit';

module('Unit | RedirectHandler', function(/*hooks*/) {
  test('exists', function(assert){
    assert.ok(RedirectHandler);
  });

  test("handles a tori-popup window with a current request key in localStorage and url", function(assert){
    assert.expect(2);

    const keyForReturn = 'some-key';
    const url = 'http://authServer?code=1234512345fw';
    const mockWindow = buildMockWindow("torii-popup:abc123", url);
    mockWindow.localStorage.getItem = function(key) {
      if (key === CURRENT_REQUEST_KEY) {
        return keyForReturn;
      }
    };

    mockWindow.localStorage.setItem = function(key, val) {
      if (key === keyForReturn) {
        assert.equal(val, url, 'url is set for parent window');
      }
    };

    const handler = RedirectHandler.create({windowObject: mockWindow});

    run(function(){
      handler.run().then(function(){}, function(){
        assert.ok(false, "run handler rejected a basic url");
      });
    });

    assert.ok(!handler.isFulfilled, "hangs the return promise forever");
  });

  test('rejects the promise if there is no request key', function(assert){
    const mockWindow = buildMockWindow("", "http://authServer?code=1234512345fw");
    const handler = RedirectHandler.create({windowObject: mockWindow});

    run(function(){
      handler.run().then(function(){
        assert.ok(false, "run handler succeeded on a url");
      }, function(){
        assert.ok(true, "run handler rejects a url without data");
      });
    });
  });

  test('does not set local storage when not a torii popup', function(assert){
    assert.expect(1);

    const mockWindow = buildMockWindow("", "http://authServer?code=1234512345fw");

    mockWindow.localStorage.setItem = function(/* key, value */) {
      assert.ok(false, "storage was set unexpectedly");
    };

    const handler = RedirectHandler.create({windowObject: mockWindow});

    run(function(){
      handler.run().then(function(){
        assert.ok(false, "run handler succeeded on a popup");
      }, function(){
        assert.ok(true, "run handler rejects a popup without a name");
      });
    });
  });

  test('closes the window when a torii popup with request', function(assert){
    assert.expect(1);

    const mockWindow = buildMockWindow("torii-popup:abc123", "http://authServer?code=1234512345fw");

    mockWindow.localStorage.getItem = function(key) {
      if (key === CURRENT_REQUEST_KEY) {
        return 'some-key';
      }
    };

    const handler = RedirectHandler.create({windowObject: mockWindow});

    mockWindow.close = function(){
      assert.ok(true, "Window was closed");
    };

    run(function(){
      handler.run();
    });
  });

  test('does not close the window when a not torii popup', function(assert){
    assert.expect(1);

    const mockWindow = buildMockWindow("", "http://authServer?code=1234512345fw");
    const handler = RedirectHandler.create({windowObject: mockWindow});

    mockWindow.close = function(){
      assert.ok(false, "Window was closed unexpectedly");
    };

    run(function(){
      handler.run().then(function(){}, function(){
        assert.ok(true, "error handler is called");
      });
    });
  });

  function buildMockWindow(windowName, url){
    return {
      name: windowName,
      location: {
        toString() {
          return url;
        }
      },
      localStorage: {
        setItem() {},
        getItem() {},
        removeItem() {}
      },
      close() {}
    };
  }
});

