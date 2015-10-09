import ApplicationRouteMixin from 'torii/routing/application-route-mixin';
import AuthenticatedRouteMixin from 'torii/routing/authenticated-route-mixin';
import { lookup, lookupFactory, register } from 'torii/lib/container-utils';

var AuthenticatedRoute = null;

function reopenOrRegister(applicationInstance, factoryName, mixin) {
  var factory = lookup(applicationInstance, factoryName);
  var basicFactory;

  if (factory) {
    factory.reopen(mixin);
  } else {
    basicFactory = lookupFactory(applicationInstance, 'route:basic');
    if (!AuthenticatedRoute) {
      AuthenticatedRoute = basicFactory.extend(AuthenticatedRouteMixin);
    }
    register(applicationInstance, factoryName, AuthenticatedRoute);
  }
}

export default function(applicationInstance, authenticatedRoutes){
  reopenOrRegister(applicationInstance, 'route:application', ApplicationRouteMixin);
  for (var i = 0; i < authenticatedRoutes.length; i++) {
    var routeName = authenticatedRoutes[i];
    var factoryName = 'route:' + routeName;
    reopenOrRegister(applicationInstance, factoryName, AuthenticatedRouteMixin);
  }
}
