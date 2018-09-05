import Evented from '@ember/object/evented';
import EmberObject from '@ember/object';
import UiServiceMixin from 'torii/mixins/ui-service-mixin';

var Iframe = EmberObject.extend(Evented, UiServiceMixin, {

  openRemote(url) {
    this.remote = document.createElement('iframe');
    this.remote.src = url;
    this.remote.id = 'torii-iframe';
    var iframeParent = '.torii-iframe-placeholder';
    document.querySelector(iframeParent).appendChild(this.remote);
  },

  closeRemote() {
    var iframeParent = document.querySelector('.torii-iframe-placeholder');

    if (this.remote.remove) {
      this.remote.remove();
    } else if (iframeParent) {
      iframeParent.removeChild(this.remote);
    }
  },

  pollRemote() {
    if (document.querySelector('#torii-iframe') === null) {
      this.trigger('didClose');
    }
  }

});

export default Iframe;
