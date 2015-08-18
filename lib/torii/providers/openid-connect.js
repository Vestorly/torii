import Oauth2 from 'torii/providers/oauth2-code';
import { configurable } from 'torii/configuration';
import jwtDecode from 'torii/lib/jwt-decoder';
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

  responseParams: ['id_token'],

  scope: configurable('scope', 'openid email'),

  responseMode: configurable('responseMode', 'query'),

  state: 'STATE',

  nonce: UUIDGenerator.generate(),

  responseType: configurable('responseType', 'token'),

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
    const name           = this.get('name');
    const url            = this.buildUrl();
    const redirectUri    = this.get('redirectUri');
    const responseParams = this.get('responseParams');

    return this.get('popup').open(url, responseParams).then(function(authData) {
      let missingResponseParams = [];

      responseParams.forEach(function(param) {
        if (authData[param] === undefined) {
          missingResponseParams.push(param);
        }
      });

      if (missingResponseParams.length) {
        throw `The response from the provider is missing these required response params: ${responseParams.join(', ')}`;
      }

      const jwt = authData[responseParams[0]];

      const decodedToken = jwtDecode(jwt);

      return {
        authorizationCode: jwt,
        token: decodedToken,
        provider: name,
        redirectUri
      };
    });
  }
});

export default OpenidConnect;
