import bootstrapTorii from 'torii/bootstrap/torii';
import {configure} from 'torii/configuration';
import config from '../config/environment';
 

var initializer = {
  name: 'torii',
  initialize: function(application) {
    if (arguments[1]) { // Ember < 2.1
      application = arguments[1];
    }
    configure(config.torii || {});
    bootstrapTorii(application);
    application.inject('route', 'torii', 'service:torii');
  }
};

if (window.DS) {
  initializer.after = 'store';
}

export default initializer;
