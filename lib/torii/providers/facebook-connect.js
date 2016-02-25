/* global FB, $ */

/**
 * This class implements authentication against facebook
 * connect using the Facebook SDK.
 */

import Ember from 'ember';
import Provider from 'torii/providers/base';
import {configurable} from 'torii/configuration';

var on = Ember.on;
var fbPromise;

function fbLoad(settings){
  if (fbPromise) { return fbPromise; }

  var original = window.fbAsyncInit;
  var locale = settings.locale;
  delete settings.locale;
  fbPromise = new Ember.RSVP.Promise(function(resolve/*, reject*/){
    window.fbAsyncInit = function(){
      FB.init(settings);
      Ember.run(null, resolve);
    };
    $.getScript('//connect.facebook.net/' + locale + '/sdk.js');
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
  return new Ember.RSVP.Promise(function(resolve, reject){
    FB.login(function(response){
      if (response.authResponse) {
        Ember.run(null, resolve, response.authResponse);
      } else {
        Ember.run(null, reject, response.status);
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

  // API:
  //
  open: function(options){
    if (options === undefined) options = {};
    var scope = this.get('scope');
    var authType = options.authType;
    var returnScopes = this.get('returnScopes');

    return fbLoad( this.settings() )
      .then(function(){
        return fbLogin(scope, returnScopes, authType);
      })
      .then(fbNormalize);
  },

  settings: function(){
    return {
      status: true,
      cookie: true,
      xfbml: this.get('xfbml'),
      version: this.get('version'),
      appId: this.get('appId'),
      channelUrl: this.get('channelUrl'),
      locale: this.get('locale')
    };
  },

  // Provide a then-able hook to be able to access FB in fetch
  loadFb: function(){
    return fbLoad( this.settings() );
  },

  // Load Facebook's script eagerly, so that the window.open
  // in FB.login will be part of the same JS frame as the
  // click itself.
  loadFbLogin: on('init', function(){
    this.loadFb();
  })
});

export default Facebook;
