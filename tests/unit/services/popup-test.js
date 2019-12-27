import { run } from '@ember/runloop';
import Popup from 'torii/services/popup';
import PopupIdSerializer from 'torii/lib/popup-id-serializer';
import { CURRENT_REQUEST_KEY } from "torii/mixins/ui-service-mixin";
import { module, test } from 'qunit';

module('Unit | Service | Popup', function(hooks) {
  let popup;

  const originalWindowOpen = window.open;

  const buildMockWindow = function(windowName){
    windowName = windowName || "";
    return {
      name: windowName,
      focus() {},
      close() {}
    };
  };

  const buildPopupIdGenerator = function(popupId){
    return {
      generate() {
        return popupId;
      }
    };
  };

  const buildMockStorageEvent = function(popupId, redirectUrl){
    return new StorageEvent('storage', {
      key: PopupIdSerializer.serialize(popupId),
      newValue: redirectUrl
    });
  };

  hooks.beforeEach(function() {
    popup = Popup.create();
    localStorage.removeItem(CURRENT_REQUEST_KEY);
  });

  hooks.afterEach(function() {
    localStorage.removeItem(CURRENT_REQUEST_KEY);
    window.open = originalWindowOpen;
    run(popup, 'destroy');
  });

  test("open resolves based on popup window", function(assert){
    assert.expect(8);

    let mockWindow;

    const done = assert.async();
    const expectedUrl = 'http://authServer';
    const redirectUrl = "http://localserver?code=fr";
    const popupId = '09123-asdf';

    popup = Popup.create({remoteIdGenerator: buildPopupIdGenerator(popupId)});

    window.open = function(url, name){
      assert.ok(true, 'calls window.open');
      assert.equal(url, expectedUrl, 'opens with expected url');

      assert.equal(PopupIdSerializer.serialize(popupId),
          localStorage.getItem(CURRENT_REQUEST_KEY),
          "adds the key to the current request item");

          mockWindow = buildMockWindow(name);
          return mockWindow;
    };

    run(function(){
      popup.open(expectedUrl, ['code']).then(function(data){
        assert.ok(true, 'resolves promise');
        assert.equal(popupId, PopupIdSerializer.deserialize(mockWindow.name), "sets the window's name properly");
        assert.deepEqual(data, {code: 'fr'}, 'resolves with expected data');
        assert.equal(null,
            localStorage.getItem(CURRENT_REQUEST_KEY),
            "removes the key from local storage");
        assert.equal(null,
            localStorage.getItem(PopupIdSerializer.serialize(popupId)),
            "removes the key from local storage");
      }, function(){
        assert.ok(false, 'rejected the open promise');
      }).finally(done);
    });


    localStorage.setItem(PopupIdSerializer.serialize(popupId), redirectUrl);
    // Need to manually trigger storage event, since it doesn't fire in the current window
    window.dispatchEvent(buildMockStorageEvent(popupId, redirectUrl));
  });

  test("open rejects when window does not open", function(assert){
    let done = assert.async();

    const closedWindow = buildMockWindow();

    closedWindow.closed = true;
    window.open = function(){
      assert.ok(true, 'calls window.open');
      return closedWindow;
    };

    run(function(){
      popup.open('http://some-url.com', ['code']).then(function(){
        assert.ok(false, 'resolves promise');
      }, function(){
        assert.ok(true, 'rejected the open promise');
        assert.ok(!localStorage.getItem(CURRENT_REQUEST_KEY), 'current request key is removed');
      }).finally(done);
    });
  });

  test("open does not resolve when receiving a storage event for the wrong popup id", function(assert){
    let done = assert.async();

    window.open = function(){
      assert.ok(true, 'calls window.open');
      return buildMockWindow();
    };

    const promise = run(function(){
      return popup.open('http://someserver.com', ['code']).then(function(){
        assert.ok(false, 'resolves the open promise');
      }, function(){
        assert.ok(false, 'rejected the open promise');
      }).finally(done);
    });

    localStorage.setItem(PopupIdSerializer.serialize("invalid"), "http://authServer");
    // Need to manually trigger storage event, since it doesn't fire in the current window
    window.dispatchEvent(buildMockStorageEvent("invalid", "http://authServer"));

    setTimeout(function(){
      assert.ok(!promise.isFulfilled, 'promise is not fulfulled by invalid data');
      assert.deepEqual("http://authServer",
          localStorage.getItem(PopupIdSerializer.serialize("invalid")),
          "doesn't remove the key from local storage");
      done();
    },10);
  });

  test("open rejects when window closes", function(assert){
    let done = assert.async();

    const mockWindow = buildMockWindow();
    window.open = function(){
      assert.ok(true, 'calls window.open');
      return mockWindow;
    };

    run(function(){
      popup.open('some-url', ['code']).then(function(){
        assert.ok(false, 'resolved the open promise');
      }, function(){
        assert.ok(true, 'rejected the open promise');
      }).finally(done);
    });

    mockWindow.closed = true;
  });

  test("localStorage state is cleaned up when parent window closes", function(assert){
    const mockWindow = buildMockWindow();
    window.open = function(){
      assert.ok(true, 'calls window.open');
      return mockWindow;
    };

    run(function(){
      popup.open('some-url', ['code']).then(function(){
        assert.ok(false, 'resolved the open promise');
      }, function(){
        assert.ok(false, 'rejected the open promise');
      });
    });

    window.onbeforeunload();

    assert.notOk(localStorage.getItem(CURRENT_REQUEST_KEY), "adds the key to the current request item");
  });
});
