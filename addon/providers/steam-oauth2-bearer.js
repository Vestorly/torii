/**
 * This class implements authentication against google
 * using the client-side OAuth2 authorization flow in a popup window.
 */

import Oauth2Bearer from 'torii/providers/oauth2-bearer';
import {configurable} from 'torii/configuration';

var SteamOauth2Bearer = Oauth2Bearer.extend({

  name:    'steam-oauth2-bearer',
  baseUrl: 'http://localhost:3000/auth/steam',

  // additional params that this provider requires
  optionalUrlParams: ['scope', 'request_visible_actions'],

  requestVisibleActions: configurable('requestVisibleActions', ''),

  responseParams: ['access_token'],

  scope: configurable('scope', 'email'),

  redirectUri: configurable('redirectUri',
                            'http://localhost:4200/oauth2callback')
});

export default SteamOauth2Bearer;
