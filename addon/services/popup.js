import ParseQueryString from 'torii/lib/parse-query-string';
import UUIDGenerator from 'torii/lib/uuid-generator';
import PopupIdSerializer from 'torii/lib/popup-id-serializer';

export var CURRENT_REQUEST_KEY = '__torii_request';

var on = Ember.on;

function stringifyOptions(options){
  var optionsStrings = [];
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      var value;
      switch (options[key]) {
        case true:
          value = '1';
          break;
        case false:
          value = '0';
          break;
        default:
          value = options[key];
      }
      optionsStrings.push(
        key+"="+value
      );
    }
  }
  return optionsStrings.join(',');
}

function prepareOptions(options){
  var width = options.width || 500,
      height = options.height || 500;
  return Ember.$.extend({
    left: ((screen.width / 2) - (width / 2)),
    top: ((screen.height / 2) - (height / 2)),
    width: width,
    height: height
  }, options);
}

function parseMessage(url, keys){
  var parser = ParseQueryString.create({url: url, keys: keys}),
      data = parser.parse();
  return data;
}

var Popup = Ember.Object.extend(Ember.Evented, {

  init: function() {
    this.popupIdGenerator = this.popupIdGenerator || UUIDGenerator;
  },

  // Open a popup window. Returns a promise that resolves or rejects
  // accoring to if the popup is redirected with arguments in the URL.
  //
  // For example, an OAuth2 request:
  //
  // popup.open('http://some-oauth.com', ['code']).then(function(data){
  //   // resolves with data.code, as from http://app.com?code=13124
  // });
  //
  open: function(url, keys, options){
    var service   = this,
        lastPopup = this.popup;


    return new Ember.RSVP.Promise(function(resolve, reject){
      if (lastPopup) {
        service.close();
      }

      var popupId = service.popupIdGenerator.generate();

      var optionsString = stringifyOptions(prepareOptions(options || {}));
      var pendingRequestKey = PopupIdSerializer.serialize(popupId);
      localStorage.setItem(CURRENT_REQUEST_KEY, pendingRequestKey);
      service.popup = window.open(url, pendingRequestKey, optionsString);

      if (service.popup && !service.popup.closed) {
        service.popup.focus();
      } else {
        reject(new Error(
          'Popup could not open or was closed'));
        return;
      }

      service.one('didClose', function(){
        var pendingRequestKey = localStorage.getItem(CURRENT_REQUEST_KEY);
        if (pendingRequestKey) {
          localStorage.removeItem(pendingRequestKey);
          localStorage.removeItem(CURRENT_REQUEST_KEY);
        }
        // If we don't receive a message before the timeout, we fail. Normally,
        // the message will be received and the window will close immediately.
        service.timeout = Ember.run.later(service, function() {
          reject(new Error("Popup was closed, authorization was denied, or a authentication message otherwise not received before the window closed."));
        }, 100);
      });

      Ember.$(window).on('storage.torii', function(event){
        var storageEvent = event.originalEvent;

        var popupIdFromEvent = PopupIdSerializer.deserialize(storageEvent.key);
        if (popupId === popupIdFromEvent){
          var data = parseMessage(storageEvent.newValue, keys);
          localStorage.removeItem(storageEvent.key);
          Ember.run(function() {
            resolve(data);
          });
        }
      });

      service.schedulePolling();

    }).finally(function(){
      // didClose will reject this same promise, but it has already resolved.
      service.close();
      service.clearTimeout();
      Ember.$(window).off('storage.torii');
    });
  },

  close: function(){
    if (this.popup) {
      this.popup = null;
      this.trigger('didClose');
    }
  },

  pollPopup: function(){
    if (!this.popup) {
      return;
    }
    if (this.popup.closed) {
      this.trigger('didClose');
    }
  },

  schedulePolling: function(){
    this.polling = Ember.run.later(this, function(){
      this.pollPopup();
      this.schedulePolling();
    }, 35);
  },

  // Clear the timeout, in case it hasn't fired.
  clearTimeout: function(){
    Ember.run.cancel(this.timeout);
    this.timeout = null;
  },

  stopPolling: on('didClose', function(){
    Ember.run.cancel(this.polling);
  }),

});

export default Popup;
