import Oauth2 from 'torii/providers/oauth2-code';
import {configurable} from 'torii/configuration';

var computed = Ember.computed;

/**
 * This class implements authentication against AzureAD
 * using the OAuth2 authorization flow in a popup window.
 * @class
 */
var AzureAdOauth2 = Oauth2.extend({
  name: 'azure-ad-oauth2',

  baseUrl: computed(function() {
    return 'https://login.windows.net/' + this.get('tennantId') + '/oauth2/authorize';
  }),

  tennantId: configurable('tennantId', 'common'),

  // additional url params that this provider requires
  requiredUrlParams: ['api-version', 'client_id'],

  optionalUrlParams: ['scope', 'nonce', 'response_mode'],

  responseMode: configurable('responseMode', null),

  responseParams: computed(function () {
    return [ this.get('responseType'), 'state' ];
  }),

  apiVersion: '1.0',

  responseType: configurable('responseType', 'code'),

  redirectUri: configurable('redirectUri', function azureRedirectUri(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  })
});

export default AzureAdOauth2;
