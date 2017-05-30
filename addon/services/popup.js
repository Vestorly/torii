import UiServiceMixin from 'torii/mixins/ui-service-mixin';

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

    // Mock WindowObjectReference
    // This leaves the state machine in loading state rather
    // than throwing an exception.
    this.remote = this.remote || {
      closed: false,
      focus() {}
    };
  },

  closeRemote: function(){
  },

  pollRemote: function(){
    if (!this.remote) {
      return;
    }
    if (this.remote.closed) {
      this.trigger('didClose');
    }
  }

});

export default Popup;
