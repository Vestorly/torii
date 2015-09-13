import Popup from 'torii/services/popup';
import PopupIdSerializer from 'torii/lib/popup-id-serializer';
import { CURRENT_REQUEST_KEY } from 'torii/mixins/ui-service-mixin';

var popup;
var originalWindowOpen = window.open;

var buildMockWindow = function(windowName){
  windowName = windowName || "";
  return {
    name: windowName,
    focus: Ember.K,
    close: Ember.K
  };
};

var buildPopupIdGenerator = function(popupId){
  return {
    generate: function(){
      return popupId;
    }
  }
};

var buildMockStorageEvent = function(popupId, redirectUrl){
  return Ember.$.Event('storage', {
    originalEvent: {
      key: PopupIdSerializer.serialize(popupId),
      newValue: redirectUrl
    }
  });
};

module("Popup - Unit", {
  setup: function(){
    popup = new Popup();
    localStorage.removeItem(CURRENT_REQUEST_KEY);
  },
  teardown: function(){
    localStorage.removeItem(CURRENT_REQUEST_KEY);
    window.open = originalWindowOpen;
    Ember.run(popup, 'destroy');
  }
});

asyncTest("open resolves based on popup window", function(){
  expect(8);
  var expectedUrl = 'http://authServer';
  var redirectUrl = "http://localserver?code=fr"
  var popupId = '09123-asdf';
  var mockWindow = null

  popup = new Popup({remoteIdGenerator: buildPopupIdGenerator(popupId)});

  window.open = function(url, name){
    ok(true, 'calls window.open');
    equal(url, expectedUrl, 'opens with expected url');

    equal(PopupIdSerializer.serialize(popupId),
        localStorage.getItem(CURRENT_REQUEST_KEY),
        "adds the key to the current request item");

    mockWindow = buildMockWindow(name);
    return mockWindow;
  };

  Ember.run(function(){
    popup.open(expectedUrl, ['code']).then(function(data){
      ok(true, 'resolves promise');
      equal(popupId, PopupIdSerializer.deserialize(mockWindow.name), "sets the window's name properly");
      deepEqual(data, {code: 'fr'}, 'resolves with expected data');
      equal(null,
          localStorage.getItem(CURRENT_REQUEST_KEY),
          "removes the key from local storage");
      equal(null,
          localStorage.getItem(PopupIdSerializer.serialize(popupId)),
          "removes the key from local storage");
      start();
    }, function(){
      ok(false, 'rejected the open promise');
      start();
    });
  });


  localStorage.setItem(PopupIdSerializer.serialize(popupId), redirectUrl);
  // Need to manually trigger storage event, since it doesn't fire in the current window
  Ember.$(window).trigger(buildMockStorageEvent(popupId, redirectUrl));
});

asyncTest("open rejects when window does not open", function(){
  var closedWindow = buildMockWindow();
  closedWindow.closed = true;
  window.open = function(url){
    ok(true, 'calls window.open');
    return closedWindow;
  };

  Ember.run(function(){
    popup.open('http://some-url.com', ['code']).then(function(data){
      ok(false, 'resolves promise');
      start();
    }, function(){
      ok(true, 'rejected the open promise');
      start();
    });
  });
});

asyncTest("open does not resolve when receiving a storage event for the wrong popup id", function(){
  window.open = function(url){
    ok(true, 'calls window.open');
    return buildMockWindow();
  };

  var promise = Ember.run(function(){
    return popup.open('http://someserver.com', ['code']).then(function(data){
      ok(false, 'resolves the open promise');
      start();
    }, function(){
      ok(false, 'rejected the open promise');
      start();
    });
  });

  localStorage.setItem(PopupIdSerializer.serialize("invalid"), "http://authServer");
  // Need to manually trigger storage event, since it doesn't fire in the current window
  Ember.$(window).trigger(buildMockStorageEvent("invalid", "http://authServer"));

  setTimeout(function(){
    ok(!promise.isFulfilled, 'promise is not fulfulled by invalid data');
    deepEqual("http://authServer",
        localStorage.getItem(PopupIdSerializer.serialize("invalid")),
        "doesn't remove the key from local storage");
    start();
  },10);
});

asyncTest("open rejects when window closes", function(){
  var mockWindow = buildMockWindow()
  window.open = function(){
    ok(true, 'calls window.open');
    return mockWindow;
  };

  Ember.run(function(){
    popup.open('some-url', ['code']).then(function(){
      ok(false, 'resolved the open promise');
      start();
    }, function(){
      ok(true, 'rejected the open promise');
      start();
    });
  });

  mockWindow.closed = true;
});
