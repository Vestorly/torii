import { later, run, cancel } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';
import Mixin from '@ember/object/mixin';
import { on } from '@ember/object/evented';
import UUIDGenerator from 'torii/lib/uuid-generator';
import PopupIdSerializer from 'torii/lib/popup-id-serializer';
import ParseQueryString from 'torii/lib/parse-query-string';
import assert from 'torii/lib/assert';
export const CURRENT_REQUEST_KEY = '__torii_request';
export const WARNING_KEY = '__torii_redirect_warning';
import { getConfiguration } from 'torii/configuration';

function parseMessage(url, keys){
  var parser = ParseQueryString.create({url: url, keys: keys});
  var data = parser.parse();
  return data;
}

var ServicesMixin = Mixin.create({

  init(){
    this._super(...arguments);
    this.remoteIdGenerator = this.remoteIdGenerator || UUIDGenerator;
  },

  // Open a remote window. Returns a promise that resolves or rejects
  // according to whether the window is redirected with arguments in the URL.
  //
  // For example, an OAuth2 request:
  //
  // popup.open('http://some-oauth.com', ['code']).then(function(data){
  //   // resolves with data.code, as from http://app.com?code=13124
  // });
  //
  // Services that use this mixin should implement openRemote
  //
  open(url, keys, options) {
    let service = this;
    let lastRemote = this.remote;
    let storageToriiEventHandler;

    return new EmberPromise(function(resolve, reject){
      if (lastRemote) {
        service.close();
      }

      var remoteId = service.remoteIdGenerator.generate();
      storageToriiEventHandler = function(storageEvent) {
        var remoteIdFromEvent = PopupIdSerializer.deserialize(storageEvent.key);
        if (remoteId === remoteIdFromEvent) {
          var data = parseMessage(storageEvent.newValue, keys);
          localStorage.removeItem(storageEvent.key);
          run(function () {
            resolve(data);
          });
        }
      }
      var pendingRequestKey = PopupIdSerializer.serialize(remoteId);
      localStorage.setItem(CURRENT_REQUEST_KEY, pendingRequestKey);
      localStorage.removeItem(WARNING_KEY);

      service.openRemote(url, pendingRequestKey, options);
      service.schedulePolling();

      var onbeforeunload = window.onbeforeunload;
      window.onbeforeunload = function() {
        if (typeof onbeforeunload === 'function') {
          onbeforeunload();
        }
        service.close();
      };

      if (service.remote && !service.remote.closed) {
        service.remote.focus();
      } else {
        localStorage.removeItem(CURRENT_REQUEST_KEY);
        reject(new Error(
          'remote could not open or was closed'));
        return;
      }

      service.one('didClose', function(){
        let configuration = getConfiguration();
        let hasWarning = localStorage.getItem(WARNING_KEY);
        if (hasWarning) {
          localStorage.removeItem(WARNING_KEY);

          assert(`[Torii] Using an OAuth redirect that loads your Ember App is deprecated and will be
              removed in a future release, as doing so is a potential security vulnerability.
              Hide this message by setting \`allowUnsafeRedirect: true\` in your Torii configuration.
          `, configuration.allowUnsafeRedirect);
        }
        var pendingRequestKey = localStorage.getItem(CURRENT_REQUEST_KEY);
        if (pendingRequestKey) {
          localStorage.removeItem(pendingRequestKey);
          localStorage.removeItem(CURRENT_REQUEST_KEY);
        }
        // If we don't receive a message before the timeout, we fail. Normally,
        // the message will be received and the window will close immediately.
        service.timeout = later(service, function() {
          reject(new Error("remote was closed, authorization was denied, or an authentication message otherwise not received before the window closed."));
        }, configuration.popupCloseTimeout || 100);
      });
      window.addEventListener('storage', storageToriiEventHandler);
    }).finally(function(){
      // didClose will reject this same promise, but it has already resolved.
      service.close();
      window.removeEventListener('storage', storageToriiEventHandler);
    });
  },

  close() {
    if (this.remote) {
      this.closeRemote();
      this.remote = null;
      this.trigger('didClose');
    }
    this.cleanUp();
  },

  cleanUp() {
    this.clearTimeout();
  },

  schedulePolling() {
    this.polling = later(this, function(){
      this.pollRemote();
      this.schedulePolling();
    }, 35);
  },

  // Clear the timeout, in case it hasn't fired.
  clearTimeout() {
    cancel(this.timeout);
    this.timeout = null;
  },

  stopPolling: on('didClose', function(){
    cancel(this.polling);
  })
});

export default ServicesMixin;
