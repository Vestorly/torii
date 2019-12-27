import EmberObject, { computed } from '@ember/object';
import requiredProperty from 'torii/lib/required-property';
import { getOwner } from 'torii/lib/container-utils';
import { configurable } from 'torii/configuration';
import configuration from 'torii/configuration';

var DEFAULT_REMOTE_SERVICE_NAME = 'popup';

/**
 * The base class for all torii providers
 * @class BaseProvider
 */
var Base = EmberObject.extend({

 /**
  * The name of the provider
  * @property {string} name
  */
  name: requiredProperty(),

  /**
   * The name of the configuration property
   * that holds config information for this provider.
   * @property {string} configNamespace
   */
  configNamespace: computed('name', function() {
    return 'providers.'+this.get('name');
  }),

  popup: computed('configuredRemoteServiceName', function() {
    var owner = getOwner(this);
    var remoteServiceName = (
      this.get('configuredRemoteServiceName') ||
      configuration.remoteServiceName ||
      DEFAULT_REMOTE_SERVICE_NAME
    );

    return owner.lookup('torii-service:'+remoteServiceName);
  }),

  configuredRemoteServiceName: configurable('remoteServiceName', null)
});

export default Base;
