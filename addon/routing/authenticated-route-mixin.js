import { resolve } from 'rsvp';
import Mixin from '@ember/object/mixin';
import { getConfiguration } from 'torii/configuration';

export default Mixin.create({
  beforeModel(transition) {
    var route = this;
    var superBefore = this._super.apply(this, arguments);
    if (superBefore && superBefore.then) {
      return superBefore.then(function() {
        return route.authenticate(transition);
      });
    } else {
      return route.authenticate(transition);
    }
  },
  authenticate(transition) {
    var configuration = getConfiguration();
    var route = this,
      session = this.get(configuration.sessionServiceName),
      isAuthenticated = this.get(configuration.sessionServiceName + '.isAuthenticated'),
      hasAttemptedAuth = isAuthenticated !== undefined;

    if (!isAuthenticated) {
      session.attemptedTransition = transition;

      if (hasAttemptedAuth) {
        return route.accessDenied(transition);
      } else {
        return session.fetch()
          .catch(function() {
            return route.accessDenied(transition);
          });
      }
    } else {
      // no-op; cause the user is already authenticated
      return resolve();
    }
  },
  accessDenied(transition) {
    if (transition.promise) {
      transition.promise.then(accessDenied);
    } else {
      accessDenied(transition);
    }
  }
});

function accessDenied(transition) {
  transition.send('accessDenied', transition);
}
