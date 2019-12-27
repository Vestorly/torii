import Evented from '@ember/object/evented';
import EmberObject from '@ember/object';
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

  return Object.assign(
    {},
    {
      left: ((screen.width / 2) - (width / 2)),
      top: ((screen.height / 2) - (height / 2)),
      width: width,
      height: height
    },
    options
  );
}

var Popup = EmberObject.extend(Evented, UiServiceMixin, {

  // Open a popup window.
  openRemote(url, pendingRequestKey, options) {
    var optionsString = stringifyOptions(prepareOptions(options || {}));
    this.remote = window.open(url, pendingRequestKey, optionsString);
  },

  closeRemote() {
  },

  pollRemote() {
    if (!this.remote) {
      return;
    }
    if (this.remote.closed) {
      this.trigger('didClose');
    }
  }

});

export default Popup;
