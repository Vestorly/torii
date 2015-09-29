import Oauth2 from 'torii/providers/oauth2-code';
import {
    configurable
}
from 'torii/configuration';

/**
 * This class implements authentication against Github
 * using the OAuth2 authorization flow in a popup window.
 * @class
 */
var TradierOauth2 = Oauth2.extend({
    name: 'tradier-oauth2',
    baseUrl: 'https://api.tradier.com/v1/oauth/authorize',
    responseParams: ['code', 'state'],
    scope: configurable('scope', 'read,write,placing,market,trade,stream'),
});

export
default TradierOauth2;
