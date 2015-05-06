/**
 * RedirectHandler will attempt to find
 * these keys in the URL. If found,
 * this is an indication to Torii that
 * the Ember app has loaded inside a popup
 * and should postMessage this data to window.opener
 */

import {postMessageFixed, readToriiMessage} from "./services/popup";

var RedirectHandler = Ember.Object.extend({

  init: function(url){
    this.url = url;
  },

  run: function(){
    var url = this.url;
    return new Ember.RSVP.Promise(function(resolve, reject){
      if (window.opener && window.opener.name === 'torii-opener') {
        postMessageFixed(window.opener, url);
        Ember.run.next(window, window.close);
      } else {
        reject('No window.opener');
      }
    });
  }

});

RedirectHandler.reopenClass({
  // untested
  handle: function(url){
    var handler = new RedirectHandler(url);
    return handler.run();
  }
});

export default RedirectHandler;
