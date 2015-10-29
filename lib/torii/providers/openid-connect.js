import Oauth2 from 'torii/providers/oauth2-code';
import { configurable } from 'torii/configuration';
import UUIDGenerator from 'torii/lib/uuid-generator';

/**
* This class implements authentication against a openid connect provider
 * using the OAuth2 authorization flow in a popup window.
 * https://openid.net/specs/openid-connect-basic-1_0.html
 * @class
 * @public
 */
const OpenIDConnect = Oauth2.extend({
  name: 'openid-connect',

  baseUrl: configurable('baseUrl'),

  // additional url params that this provider requires
  requiredUrlParams: ['state', 'client_id', 'nonce', 'response_mode', 'scope'],

  optionalUrlParams: [],

  responseParams: ['id_token', 'state'],

  scope: configurable('scope', 'openid email'),

  responseMode: configurable('responseMode', 'query'),

  state: 'STATE',

  nonce: UUIDGenerator.generate(),

  responseType: 'token',

  clientId: configurable('clientId', ''),

  redirectUri: configurable('redirectUri', function() {
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  }),

  fetch(data) {
    return data;
  },

  open() {
    this.set('optionalUrlParams', []);
    var name        = this.get('name'),
        url         = this.buildUrl(),
        redirectUri = this.get('redirectUri'),
        responseParams = this.get('responseParams'),
        responseType = this.get('responseType'),
        state = this.get('state'),
        shouldCheckState = responseParams.indexOf('state') !== -1;

    return this.get('popup').open(url, responseParams).then(function(authData){
      var missingResponseParams = [];

      responseParams.forEach(function(param){
        if (authData[param] === undefined) {
          missingResponseParams.push(param);
        }
      });

      if (missingResponseParams.length){
        throw new Error("The response from the provider is missing " +
              "these required response params: " + missingResponseParams.join(', '));
      }

      if (shouldCheckState && authData.state !== state) {
        throw new Error('The response from the provider has an incorrect ' +
                        'session state param: should be "' + state + '", ' +
                        'but is "' + authData.state + '"');
      }

      return {
        authorizationCode: authData['id_token'],
        provider: name,
        redirectUri: redirectUri
      };
    });
  }
});

export default OpenIDConnect;
