/**
 * RedirectHandler will attempt to find
 * these keys in the URL. If found,
 * this is an indication to Torii that
 * the Ember app has loaded inside a popup
 * and should postMessage this data to window.opener
 */

import { CURRENT_REQUEST_KEY, WARNING_KEY } from "./mixins/ui-service-mixin";
import configuration from 'torii/configuration';

export class ToriiRedirectError extends Ember.Error {
  constructor() {
    super(...arguments);
    this.name = 'ToriiRedirectError';
  }
}

var RedirectHandler = Ember.Object.extend({

  run: function(){
    var windowObject = this.windowObject;

    return new Ember.RSVP.Promise(function(resolve, reject){
      var pendingRequestKey = windowObject.localStorage.getItem(CURRENT_REQUEST_KEY);
      windowObject.localStorage.removeItem(CURRENT_REQUEST_KEY);
      if (pendingRequestKey) {
        var url = windowObject.location.toString();
        windowObject.localStorage.setItem(WARNING_KEY, 'true');
        windowObject.localStorage.setItem(pendingRequestKey, url);

        var remoteServiceName = configuration.remoteServiceName || 'popup';
        if(remoteServiceName === 'popup'){
          // NOTE : If a single provider has been configured to use the 'iframe'
          // service, this next line will still be called. It will just fail silently.
          windowObject.close();
        }
      } else {
        reject(new ToriiRedirectError('Not a torii popup'));
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
