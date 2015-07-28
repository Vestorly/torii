import UiServiceMixin from 'torii/mixins/ui-service-mixin';

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

var Popup = Ember.Object.extend(Ember.Evented, UiServiceMixin, {

  // Open a popup window.
  openRemote: function(url, pendingRequestKey, options){
    var optionsString = stringifyOptions(prepareOptions(options || {}));
    this.remote = window.open(url, pendingRequestKey, optionsString);
    this.schedulePolling();
  },

  closeRemote: function(){
  },

  cleanUp: function(){
    this.clearTimeout();
  },

  pollRemote: function(){
    if (!this.remote) {
      return;
    }
    if (this.remote.closed) {
      this.trigger('didClose');
    }
  },

  schedulePolling: function(){
    this.polling = Ember.run.later(this, function(){
      this.pollRemote();
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
  })

});

export default Popup;
