/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    torii: {
      providers: {
        'linked-in-oauth2': {
          apiKey: '772yus6d70pf11'
        },

        'github-oauth2': {
          apiKey: '36564132549469e48c02',
        },

        'google-oauth2': {
          apiKey: '139338504777-321kme2daihrj8kr8g739ntne4h2bghk.apps.googleusercontent.com',
          redirectUri: 'http://torii-example.com:4200/torii/redirect.html'
        },

        'google-oauth2-bearer': {
          apiKey: '139338504777-321kme2daihrj8kr8g739ntne4h2bghk.apps.googleusercontent.com',
          scope: 'email',
          redirectUri: 'http://torii-example.com:4200/torii/redirect.html'
        },

        'facebook-connect': {
          appId:      '744221908941738'
        },

        'facebook-oauth2': {
          apiKey:      '744221908941738',
        },

        'google-oauth2-bearer-v2' : {
          // put your Google client ID here
          apiKey: '139338504777-321kme2daihrj8kr8g739ntne4h2bghk.apps.googleusercontent.com',
          // use the same URI here as one configured in your Google developer console
          redirectUri: 'http://torii-example.com:4200/torii/redirect.html',
          // for a list of all possible scopes, see
          // https://developers.google.com/identity/protocols/googlescopes
          scope: 'https://www.googleapis.com/auth/userinfo.email'
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
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.torii = {
      sessionServiceName: 'session',
      providers: {}
    };
    ENV.APP.autoboot = false;
  }

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
