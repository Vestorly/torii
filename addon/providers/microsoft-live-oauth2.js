/**
 * This class implements authentication against Microsoft Live
 * using the OAuth2 authorization flow in a popup window.
 */

import Oauth2 from 'torii/providers/oauth2-code';
import {configurable} from 'torii/configuration';

var MicrosoftLiveOauth2 = Oauth2.extend({

  name: 'microsoft-live-oauth2',
  baseUrl: 'https://login.live.com/oauth20_authorize.srf',

  responseParams: ['code', 'state'],

  scope: configurable('scope', 'wl.basic wl.signin wl.emails'),

  display: 'popup',
  redirectUri: configurable('redirectUri', function(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  }),

});

export default MicrosoftLiveOauth2;
