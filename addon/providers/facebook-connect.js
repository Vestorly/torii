/* global FB */

/**
 * This class implements OAuth authorization for Facebook
 * connect using the Facebook Connect SDK.
 * It eagerly loads the Facebook Connect script using the settings provided
 * unless it detects the presence of the global `window.FB`.
 */

import { run } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';
import Provider from 'torii/providers/base';
import { loadScript } from './-private/utils';
import { configurable } from 'torii/configuration';

var fbPromise;

function fbLoad(settings){
  if (fbPromise) { return fbPromise; }

  var original = window.fbAsyncInit;
  var locale = settings.locale;
  delete settings.locale;
  fbPromise = new EmberPromise(function(resolve){
    if (window.FB) {
      return resolve();
    }
    window.fbAsyncInit = function(){
      FB.init(settings);
      run(null, resolve);
    };
    loadScript('//connect.facebook.net/' + locale + '/sdk.js');
  }).then(function(){
    window.fbAsyncInit = original;
    if (window.fbAsyncInit) {
      window.fbAsyncInit.hasRun = true;
      window.fbAsyncInit();
    }
  });

  return fbPromise;
}

function fbLogin(scope, returnScopes, authType){
  return new EmberPromise(function(resolve, reject){
    FB.login(function(response){
      if (response.authResponse) {
        run(null, resolve, response.authResponse);
      } else {
        run(null, reject, response.status);
      }
    }, { scope: scope, return_scopes: returnScopes, auth_type: authType });
  });
}

function fbNormalize(response){
  var normalized = {
    userId: response.userID,
    accessToken: response.accessToken,
    expiresIn: response.expiresIn
  };
  if (response.grantedScopes) {
    normalized.grantedScopes = response.grantedScopes;
  }
  return normalized;
}

var Facebook = Provider.extend({

  // Facebook connect SDK settings:
  name:  'facebook-connect',
  scope: configurable('scope', 'email'),
  returnScopes: configurable('returnScopes', false),
  appId: configurable('appId'),
  version: configurable('version', 'v2.2'),
  xfbml: configurable('xfbml', false),
  channelUrl: configurable('channelUrl', null),
  locale: configurable('locale', 'en_US'),

  init() {
    this._super(...arguments);
    fbLoad(this.settings());
  },

  // API:
  //
  open(options) {
    if (options === undefined) options = {};
    var scope = this.get('scope');
    var authType = options.authType;
    var returnScopes = this.get('returnScopes');

    return fbLoad(this.settings())
      .then(function(){
        return fbLogin(scope, returnScopes, authType);
      })
      .then(fbNormalize);
  },

  settings() {
    return {
      status: true,
      cookie: true,
      xfbml: this.get('xfbml'),
      version: this.get('version'),
      appId: this.get('appId'),
      channelUrl: this.get('channelUrl'),
      locale: this.get('locale')
    };
  }
});

export default Facebook;
