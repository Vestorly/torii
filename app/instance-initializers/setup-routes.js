/* eslint-disable ember/new-module-imports */

import Ember from 'ember';
import bootstrapRouting from 'torii/bootstrap/routing';
import { getConfiguration } from 'torii/configuration';
import getRouterInstance from 'torii/compat/get-router-instance';
import getRouterLib from 'torii/compat/get-router-lib';
import "torii/router-dsl-ext";

export default {
  name: 'torii-setup-routes',
  initialize(applicationInstance /*, registry */){
    const configuration = getConfiguration();

    if (!configuration.sessionServiceName) {
      return;
    }

    let router = getRouterInstance(applicationInstance);
    var setupRoutes = function(){
      let routerLib = getRouterLib(router);
      var authenticatedRoutes = routerLib.authenticatedRoutes;
      var hasAuthenticatedRoutes = !Ember.isEmpty(authenticatedRoutes);
      if (hasAuthenticatedRoutes) {
        bootstrapRouting(applicationInstance, authenticatedRoutes);
      }
      router.off('willTransition', setupRoutes);
    };
    router.on('willTransition', setupRoutes);
  }
};
