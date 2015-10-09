import Oauth2Bearer from 'torii/providers/oauth2-bearer';
import {configurable} from 'torii/configuration';

/*
* This class implements authentication against Edmodo
* with the token flow. For more information see
* https://developers.edmodo.com/edmodo-connect/docs/#connecting-your-application
* */
export default Oauth2Bearer.extend({
  name: 'edmodo-connect',
  baseUrl: 'https://api.edmodo.com/oauth/authorize',
  responseParams: ['access_token'],

  /* Configurable parameters */
  redirectUri: configurable('redirectUri'),
  // See https://developers.edmodo.com/edmodo-connect/docs/#connecting-your-application for the full list of scopes
  scope: configurable('scope', 'basic')
});
