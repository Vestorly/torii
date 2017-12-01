/**
 * This class implements authentication against google
 * using the client-side OAuth2 authorization flow in a popup window.
 */

import Oauth2Bearer from 'torii/providers/oauth2-bearer';
import { configurable } from 'torii/configuration';

var GoogleOauth2Bearer = Oauth2Bearer.extend({

  name:    'google-oauth2-bearer',
  baseUrl: 'https://accounts.google.com/o/oauth2/auth',

  // additional params that this provider requires
  optionalUrlParams: ['scope', 'request_visible_actions', 'hd'],

  requestVisibleActions: configurable('requestVisibleActions', ''),

  responseParams: ['access_token'],

  scope: configurable('scope', 'email'),

  redirectUri: configurable('redirectUri',
                            'http://localhost:4200/oauth2callback'),
  hd: configurable('hd', '')
});

export default GoogleOauth2Bearer;
