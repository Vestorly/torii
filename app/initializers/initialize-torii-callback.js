import configuration from 'torii/configuration';
import RedirectHandler from 'torii/redirect-handler';

export default {
  name: 'torii-callback',
  before: 'torii',
  initialize: function(application) {
    if (arguments[1]) { // Ember < 2.1
      application = arguments[1];
    }
    if (configuration.disableRedirectInitializer) {
      return;
    }
    application.deferReadiness();
    RedirectHandler.handle(window).catch(function(){
      application.advanceReadiness();
    });
  }
};
