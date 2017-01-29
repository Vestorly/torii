/**
 * This class implements authentication against google's authentication server
 * using v2, using the client-side OAuth2 authorization flow in a popup window.
 */

import OAuth2Code from 'torii/providers/oauth2-code';
import {configurable} from 'torii/configuration';
import Ember from 'ember';

var GoogleOauth2BearerV2 = OAuth2Code.extend({

  name:    'google-oauth2-bearer-v2',

  baseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',

  tokenValidationUrl: 'https://www.googleapis.com/oauth2/v2/tokeninfo',

  // additional params that this provider requires
  optionalUrlParams: ['scope', 'request_visible_actions'],

  scope: configurable('scope'),

  requestVisibleActions: configurable('requestVisibleActions', ''),

  responseType: 'token',

  responseParams: ['access_token', 'token_type', 'expires_in'],

  redirectUri: configurable('redirectUri'),

  /**
   * @method open
   * @return {Promise<object>} If the authorization attempt is a success,
   * the promise will resolve an object containing the following keys:
   *   - authorizationToken: The `token` from the 3rd-party provider
   *   - provider: The name of the provider (i.e., google-oauth2)
   *   - redirectUri: The redirect uri (some server-side exchange flows require this)
   * If there was an error or the user either canceled the authorization or
   * closed the popup window, the promise rejects.
   */
  open: function(options){
    var name        = this.get('name'),
        url         = this.buildUrl(),
        redirectUri = this.get('redirectUri'),
        responseParams = this.get('responseParams'),
        tokenValidationUrl = this.get('tokenValidationUrl'),
        clientId = this.get('apiKey');

    return this.get('popup').open(url, responseParams, options).then(function(authData){
      var missingResponseParams = [];

      responseParams.forEach(function(param){
        if (authData[param] === undefined) {
          missingResponseParams.push(param);
        }
      });

      if (missingResponseParams.length){
        throw new Error("The response from the provider is missing " +
              "these required response params: " +
              missingResponseParams.join(', '));
      }

      /* at this point 'authData' should look like:
      {
        access_token: '<some long acces token string>',
        expires_in: '<time in s, was '3600' in jan 2017>',
        token_type: 'Bearer'
      }
      */

      // Validation of the token, for details, see
      // https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken

      // Token validation request
      Ember.$.ajax(
        {
          type: 'GET',
          url: tokenValidationUrl,
          data: {
            'access_token': authData['access_token']
          },
          success: function (jsonResponse) {
            /* the response is a JSON that looks like:
            {
              "audience":"8819981768.apps.googleusercontent.com",
              "user_id":"123456789",
              "scope":"profile email",
              "expires_in":436
            }
            */
            // the token is valid if the 'audience' is the same as the client ID
            if (jsonResponse.audience === clientId) {
              // authentication succeeded
              return {
                authorizationToken: authData,
                provider: name,
                redirectUri: redirectUri
              };
            } else {
              throw new Error('Invalid access token.');
            }
          },
          error: function (response) {
            throw new Error('Connot reach the token validation server: ' +
                             tokenValidationUrl);
          }
        }
      );
    });
  }
});

export default GoogleOauth2BearerV2;
