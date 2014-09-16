/**
 * RedirectHandler will attempt to find
 * these keys in the URL. If found,
 * this is an indication to Torii that
 * the Ember app has loaded inside a popup
 * and should postMessage this data to window.opener
 */

var RedirectHandler = Ember.Object.extend({

  init: function(url){
    this.url = url;
  },

  run: function(){
    var url = this.url;
    return new Ember.RSVP.Promise(function(resolve, reject){
      if (window.opener && window.opener.__torii) {
        var data = "__torii_message:"+url;
        window.opener.postMessage(data, '*');
        // TODO listen for a message from the parent allowing
        // this promise to continue. As written, the popup will
        // hang until the parent window closes it.
      } else {
        reject("'__torii' is false or undefined on window.opener");
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
