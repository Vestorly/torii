import Oauth2 from 'torii/providers/oauth2-code';
import {configurable} from 'torii/configuration';

/**
 * This class implements authentication against Outlook
 * using the OAuth2 authorization flow in a popup window.
 *
 * @class OutlookInOauth2
 */
var OutlookOauth2 = Oauth2.extend({
  name:       'outlook-in-oauth2',
  baseUrl:    'https://login.live.com/oauth20_authorize.srf',

  // additional url params that this provider requires
  responseParams: ['code'],

  responseType: configurable('response_type', 'code'),
  scope: configurable('scope', 'wl.basic wl.contacts_emails'),

  redirectUri: configurable('redirectUri', function(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  })

});

export default OutlookOauth2;
