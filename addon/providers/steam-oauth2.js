import {configurable} from 'torii/configuration';
import Oauth2 from 'torii/providers/oauth2-code';

export default Oauth2.extend({
  name:    'steam-oauth2',
  baseUrl: 'http://localhost:3000/auth/steam',

  // Additional url params that this provider requires
  requiredUrlParams: ['display'],

  responseParams: ['code', 'state'],

  scope:        configurable('scope', 'email'),

  display: 'popup',
  redirectUri: configurable('redirectUri', function(){
    // A hack that allows redirectUri to be configurable
    // but default to the superclass
    return this._super();
  })  
});
