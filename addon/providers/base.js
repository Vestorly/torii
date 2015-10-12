import requiredProperty from 'torii/lib/required-property';
import { getConfiguration } from 'torii/configuration';

var computed = Ember.computed;

/**
 * The base class for all torii providers
 * @class BaseProvider
 */
var Base = Ember.Object.extend({

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
  configNamespace: computed('name', function(){
    return 'providers.'+this.get('name');
  })
});

export default Base;
