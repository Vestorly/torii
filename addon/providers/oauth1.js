/*
 * This class implements authentication against an API
 * using the OAuth1.0a request token flow in a popup window.
 */

import Provider from 'torii/providers/base';
import { configurable } from 'torii/configuration';

var Oauth1 = Provider.extend({
  name: 'oauth1',

  requestTokenUri: configurable('requestTokenUri'),

  buildRequestTokenUrl() {
    return this.get('requestTokenUri');
  },

  open(options) {
    var name        = this.get('name'),
        url         = this.buildRequestTokenUrl();

    return this.get('popup').open(url, ['code'], options).then(function(authData){
      authData.provider = name;
      return authData;
    });
  }
});

export default Oauth1;
