/**
 * This class implements authentication against google
 * using the OAuth2 authorization flow in a popup window.
 */

import Oauth2 from 'torii/providers/oauth2-code';
import { configurable } from 'torii/configuration';

var GoogleOauth2 = Oauth2.extend({

  name:    'google-oauth2',
  baseUrl: 'https://accounts.google.com/o/oauth2/auth',

  // additional params that this provider requires
  optionalUrlParams: ['scope', 'request_visible_actions', 'access_type', 'approval_prompt', 'hd'],

  requestVisibleActions: configurable('requestVisibleActions', ''),

  accessType: configurable('accessType', ''),

  responseParams: ['code', 'state'],

  scope: configurable('scope', 'email'),

  approvalPrompt: configurable('approvalPrompt', 'auto'),

  redirectUri: configurable('redirectUri', function(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  }),

  hd: configurable('hd', '')
});

export default GoogleOauth2;
