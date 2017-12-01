import { lookup } from 'torii/lib/container-utils';
import { getConfiguration } from 'torii/configuration';

export default {
  name: 'torii-walk-providers',
  initialize(applicationInstance) {
    let configuration = getConfiguration();
    // Walk all configured providers and eagerly instantiate
    // them. This gives providers with initialization side effects
    // like facebook-connect a chance to load up assets.
    for (var key in configuration.providers) {
      if (configuration.providers.hasOwnProperty(key)) {
        lookup(applicationInstance, 'torii-provider:'+key);
      }
    }
  }
};
