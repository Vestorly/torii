import Oauth2 from 'torii/providers/oauth2-code';
import { configurable } from 'torii/configuration';

/**
 * This class implements authentication against Linked In
 * using the OAuth2 authorization flow in a popup window.
 *
 * @class LinkedInOauth2
 */
var LinkedInOauth2 = Oauth2.extend({
  name:       'linked-in-oauth2',
  baseUrl:    'https://www.linkedin.com/oauth/v2/authorization',

  responseParams: ['code', 'state'],

  redirectUri: configurable('redirectUri', function(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  })

});

export default LinkedInOauth2;
