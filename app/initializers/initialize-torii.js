import bootstrapTorii from 'torii/bootstrap/torii';
import {configure} from 'torii/configuration';
import config from '../config/environment';

var initializer = {
  name: 'torii',

  initialize(application) {
    if (arguments[1]) { // Ember < 2.1
      application = arguments[1];
    }

    configure(config.torii || {});
    bootstrapTorii(application);
    application.inject('route', 'torii', 'service:torii');
  }
};

export default initializer;
