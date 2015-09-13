import Iframe from 'torii/services/iframe';
import PopupIdSerializer from 'torii/lib/popup-id-serializer';
import { CURRENT_REQUEST_KEY } from 'torii/mixins/ui-service-mixin';

var iframe;
var originalWindowOpen = window.open;

var buildIframeIdGenerator = function(iframeId){
  return {
    generate: function(){
      return iframeId;
    }
  }
};

var buildMockStorageEvent = function(iframeId, redirectUrl){
  return Ember.$.Event('storage', {
    originalEvent: {
      key: PopupIdSerializer.serialize(iframeId),
      newValue: redirectUrl
    }
  });
};

module("Iframe - Unit", {
  setup: function(){
    iframe = new Iframe();
    localStorage.removeItem(CURRENT_REQUEST_KEY);
  },
  teardown: function(){
    localStorage.removeItem(CURRENT_REQUEST_KEY);
    window.open = originalWindowOpen;
    Ember.$('#torii-iframe').remove();
    Ember.run(iframe, 'destroy');
  }
});

asyncTest("open resolves based on an embedded iframe window", function(){
  expect(4);
  var expectedUrl = 'http://authServer';
  var redirectUrl = "http://localserver?code=fr"
  var iframeId = '09123-asdf';
  var mockWindow = null

  iframe = new Iframe({remoteIdGenerator: buildIframeIdGenerator(iframeId)});

  Ember.run(function(){
    iframe.open(expectedUrl, ['code']).then(function(data){
      ok(true, 'resolves promise');
      deepEqual(data, {code: 'fr'}, 'resolves with expected data');
      equal(null,
          localStorage.getItem(CURRENT_REQUEST_KEY),
          "removes the key from local storage");
      equal(null,
          localStorage.getItem(PopupIdSerializer.serialize(iframeId)),
          "removes the key from local storage");
      start();
    }, function(){
      ok(false, 'rejected the open promise');
      start();
    });
  });


  localStorage.setItem(PopupIdSerializer.serialize(iframeId), redirectUrl);
  // Need to manually trigger storage event, since it doesn't fire in the current window
  Ember.$(window).trigger(buildMockStorageEvent(iframeId, redirectUrl));
});



asyncTest("open does not resolve when receiving a storage event for the wrong iframe id", function(){

  var promise = Ember.run(function(){
    return iframe.open('http://someserver.com', ['code']).then(function(data){
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

asyncTest("open rejects when the iframe is removed", function(){
  

  Ember.run(function(){
    iframe.open('some-url', ['code']).then(function(){
      ok(false, 'resolved the open promise');
      start();
    }, function(){
      ok(true, 'rejected the open promise');
      start();
    });
  });

  Ember.$('#torii-iframe').remove();

});
