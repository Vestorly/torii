import {configurable} from 'torii/configuration';
import Oauth2 from 'torii/providers/oauth2-code';

export default Oauth2.extend({
  name:    'facebook-oauth2',
  baseUrl: 'https://www.facebook.com/dialog/oauth',

  // Additional url params that this provider requires
  requiredUrlParams: ['display'],

  responseParams: ['code'],

  scope:        configurable('scope', 'email'),

  display: 'popup',
  redirectUri: configurable('redirectUri', function(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  }),

  open: function(options) {
    return this._super(options).then(function(authData){
      if (authData.authorizationCode && authData.authorizationCode === '200') {
        // indication that the user hit 'cancel', not 'ok'
        throw 'User canceled authorization';
      }

      return authData;
    });
  }
});
