function lookupProvider(container, providerName){
  return container.lookup('torii-provider:'+providerName);
}

function proxyToProvider(methodName, requireMethod){
  return function(providerName, options){
    var container = this.container;
    var provider = lookupProvider(container, providerName);
    if (!provider) {
      throw new Error("Expected a provider named '"+providerName+"' " +
                      ", did you forget to register it?");
    }

    if (!provider[methodName]) {
      if (requireMethod) {
        throw new Error("Expected provider '"+providerName+"' to define " +
                        "the '"+methodName+"' method.");
      } else {
        return Ember.RSVP.Promise.resolve({});
      }
    }
    return new Ember.RSVP.Promise(function(resolve, reject){
      resolve( provider[methodName](options) );
    });
  };
}

/**
 * Torii is an engine for authenticating against various
 * providers. For example, you can open a session with
 * Linked In via Oauth2 and authorization codes by doing
 * the following:
 *
 *     Torii.open('linked-in-oauth2').then(function(authData){
 *       console.log(authData.authorizationCode);
 *     });
 *
 * For traditional authentication flows, you will often use
 * Torii via the Torii.Session API.
 *
 * @class Torii
 */
export default Ember.Service.extend({

  /**
   * Open an authorization against an API. A promise resolving
   * with an authentication response object is returned. These
   * response objects,  are found in the "torii/authentications"
   * namespace.
   *
   * @method open
   * @param {String} providerName The provider to open
   * @return {Ember.RSVP.Promise} Promise resolving to an authentication object
   */
  open:  proxyToProvider('open', true),

  /**
   * Return a promise which will resolve if the provider has
   * already been opened.
   *
   * @method fetch
   * @param {String} providerName The provider to open
   * @return {Ember.RSVP.Promise} Promise resolving to an authentication object
   */
  fetch:  proxyToProvider('fetch'),

  /**
   * Return a promise which will resolve when the provider has been
   * closed. Closing a provider may not always be a meaningful action,
   * and may be better handled by torii's session management instead.
   *
   * @method close
   * @param {String} providerName The provider to open
   * @return {Ember.RSVP.Promise} Promise resolving when the provider is closed
   */
  close:  proxyToProvider('close')
});
