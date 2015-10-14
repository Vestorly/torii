import bootstrapRouting from 'torii/bootstrap/routing';
import { getConfiguration } from 'torii/configuration';
import "torii/router-dsl-ext";

export default {
  name: 'torii-setup-routes',
  initialize: function(applicationInstance, registry){
    const configuration = getConfiguration();

    if (!configuration.sessionServiceName) {
      return;
    }

    var router = applicationInstance.get('router');
    var setupRoutes = function(){
      var authenticatedRoutes = router.router.authenticatedRoutes;
      var hasAuthenticatedRoutes = !Ember.isEmpty(authenticatedRoutes);
      if (hasAuthenticatedRoutes) {
        bootstrapRouting(applicationInstance, authenticatedRoutes);
      }
      router.off('willTransition', setupRoutes);
    };
    router.on('willTransition', setupRoutes);
  }
};
