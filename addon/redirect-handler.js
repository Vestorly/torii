/**
 * RedirectHandler will attempt to find
 * these keys in the URL. If found,
 * this is an indication to Torii that
 * the Ember app has loaded inside a popup
 * and should postMessage this data to window.opener
 */

import PopupIdSerializer from "./lib/popup-id-serializer";
import { CURRENT_REQUEST_KEY } from "./services/popup";

var RedirectHandler = Ember.Object.extend({

  run: function(){
    var windowObject = this.windowObject;

    return new Ember.RSVP.Promise(function(resolve, reject){
      var pendingRequestKey = windowObject.localStorage.getItem(CURRENT_REQUEST_KEY);
      windowObject.localStorage.removeItem(CURRENT_REQUEST_KEY);
      if (pendingRequestKey) {
        var url = windowObject.location.toString();
        windowObject.localStorage.setItem(pendingRequestKey, url);

        windowObject.close();
      } else{
        reject('Not a torii popup');
      }
    });
  }

});

RedirectHandler.reopenClass({
  // untested
  handle: function(windowObject){
    var handler = RedirectHandler.create({windowObject: windowObject});
    return handler.run();
  }
});

export default RedirectHandler;
