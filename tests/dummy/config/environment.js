/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'dummy',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },
    torii: {
      providers: {
        'github-oauth2': {
          apiKey: '954836589bc32e767422'
        },
        'google-oauth2-bearer-v2' : {
          // put your Google client ID here
          apiKey: '<your Google client ID here>',
          // use the same URI here as one configured in your Google developer console
          redirectUri: 'http://localhost:4200',
          // for a list of all possible scopes, see
          // https://developers.google.com/identity/protocols/googlescopes
          scope: 'https://www.googleapis.com/auth/gmail.readonly'
        }
      }
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.torii = {
      sessionServiceName: 'session',
      providers: {}
    };
  }

  if (environment === 'production') {

  }

  return ENV;
};
