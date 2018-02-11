import { Promise as EmberPromise } from 'rsvp';
import { run } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import OAuth2Code from 'torii/providers/oauth2-code';
import { configurable } from 'torii/configuration';

/**
 * This class implements a provider allowing authentication against google's
 * authentication server using v2 of google's OAuth2 authentication flow. The
 * user is invited to authenticate in a popup window. Once a token is obtained,
 * it is validated by a second HTTP request (to another url). Authentication is
 * complte once this validation step has succeeded, and the token is returned.
 */
var GoogleOauth2BearerV2 = OAuth2Code.extend({

  name:    'google-oauth2-bearer-v2',

  baseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',

  tokenValidationUrl: 'https://www.googleapis.com/oauth2/v2/tokeninfo',

  // additional parameters that this provider requires
  optionalUrlParams: ['scope', 'request_visible_actions'],

  // a scope MUST be given (no default value because there are so many possible
  // at Google)
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
  open(options) {

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

      // Token validation. For details, see
      // https://developers.google.com/identity/protocols/OAuth2UserAgent#validatetoken
      return new EmberPromise(function(resolve, reject) {
        // Token validation request
        let xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
          var jsonResponse = JSON.parse(xhr.responseText);
          /* the response is a JSON that looks like:
          {
            "audience":"8819981768.apps.googleusercontent.com",
            "user_id":"123456789",
            "scope":"profile email",
            "expires_in":436
          }
          */
          // the token is valid if the 'audience' is the same as the
          // 'client_id' (apiKey) provided to initiate authentication
          if (jsonResponse.audience === clientId) {
            // authentication succeeded. Add name and redirectUri to the
            // authentication data and resolve
            run(() => resolve(assign(authData, { provider: name, redirectUri: redirectUri })));
          } else if (jsonResponse.audience === undefined) {
            // authentication failed because the response from the server
            // is not as expected (no 'audience' field)
            run(() => reject(new Error("Unexpected response from token validation server. The 'audience' field may be missing.")));
          } else {
            // authentication failed because the token is invalid or has
            // been tempered with
            run(() => reject(new Error("Access token is invalid or has been tempered with. You may be subject to a 'confused deputy' attack.")));
          }
        };
        xhr.onerror = function() {
          // authentication failed because the validation request failed
          run(() => reject(new Error(`Token validation request failed with status '${xhr.statusText}' (server '${tokenValidationUrl}' '${xhr.responseText}').`)));
        };
        xhr.open('GET', `${tokenValidationUrl}?access_token=${encodeURIComponent(authData['access_token'])}`);
        xhr.send();
      });
    });
  },

  fetch(authenticationData) {
    // this is the most basic for ember-simple-auth to work with this provider,
    // but the session could actually be checked and renewed here if the token
    // is too old.
    return authenticationData;
  }
});

export default GoogleOauth2BearerV2;
