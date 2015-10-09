import LinkedInOauth2Provider from 'torii/providers/linked-in-oauth2';
import GoogleOauth2Provider from 'torii/providers/google-oauth2';
import GoogleOauth2BearerProvider from 'torii/providers/google-oauth2-bearer';
import FacebookConnectProvider from 'torii/providers/facebook-connect';
import FacebookOauth2Provider from 'torii/providers/facebook-oauth2';
import ApplicationAdapter from 'torii/adapters/application';
import TwitterProvider from 'torii/providers/twitter-oauth1';
import GithubOauth2Provider from 'torii/providers/github-oauth2';
import AzureAdOauth2Provider from 'torii/providers/azure-ad-oauth2';
import StripeConnectProvider from 'torii/providers/stripe-connect';
import EdmodoConnectProvider from 'torii/providers/edmodo-connect';

import ToriiService from 'torii/services/torii';
import PopupService from 'torii/services/popup';

import { hasRegistration } from 'torii/lib/container-utils';

export default function(application) {
  application.register('service:torii', ToriiService);

  application.register('torii-provider:linked-in-oauth2', LinkedInOauth2Provider);
  application.register('torii-provider:google-oauth2', GoogleOauth2Provider);
  application.register('torii-provider:google-oauth2-bearer', GoogleOauth2BearerProvider);
  application.register('torii-provider:facebook-connect', FacebookConnectProvider);
  application.register('torii-provider:facebook-oauth2', FacebookOauth2Provider);
  application.register('torii-provider:twitter', TwitterProvider);
  application.register('torii-provider:github-oauth2', GithubOauth2Provider);
  application.register('torii-provider:azure-ad-oauth2', AzureAdOauth2Provider);
  application.register('torii-provider:stripe-connect', StripeConnectProvider);
  application.register('torii-provider:edmodo-connect', EdmodoConnectProvider);
  application.register('torii-adapter:application', ApplicationAdapter);

  application.register('torii-service:popup', PopupService);

  application.inject('torii-provider', 'popup', 'torii-service:popup');

  if (window.DS) {
    var storeFactoryName = 'store:main';
    if (hasRegistration(application, 'service:store')) {
      storeFactoryName = 'service:store';
    }
    application.inject('torii-provider', 'store', storeFactoryName);
    application.inject('torii-adapter', 'store', storeFactoryName);
  }
}
