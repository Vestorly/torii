import config from '../config/environment';
import RedirectHandler from 'torii/redirect-handler';

export default {
  name: 'torii-callback',
  before: 'torii',
  initialize(application) {
    if (arguments[1]) { // Ember < 2.1
      application = arguments[1];
    }

    if (config.torii && config.torii.disableRedirectInitializer) {
      return;
    }

    application.deferReadiness();
    RedirectHandler.handle(window).catch(function(){
      application.advanceReadiness();
    });
  }
};
