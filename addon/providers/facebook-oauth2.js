import {configurable} from 'torii/configuration';
import Oauth2 from 'torii/providers/oauth2-code';

export default Oauth2.extend({
  name:    'facebook-oauth2',
  baseUrl: 'https://www.facebook.com/dialog/oauth',

  // Additional url params that this provider requires
  requiredUrlParams: ['display'],

  responseParams: ['code', 'state'],

  scope:        configurable('scope', 'email'),

  display: 'popup',
  redirectUri: configurable('redirectUri', function(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  }),

  open: function() {
    return this._super().then(function(authData){
      if (authData.authorizationCode && authData.authorizationCode === '200') {
        // indication that the user hit 'cancel', not 'ok'
        throw new Error('User canceled authorization');
      }

      return authData;
    });
  }
});
