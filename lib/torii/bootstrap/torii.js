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
import configuration from 'torii/configuration';

import ToriiService from 'torii/services/torii';
import PopupService from 'torii/services/popup';
import IframeService from 'torii/services/iframe';

export default function(container) {
  container.register('service:torii', ToriiService);

  container.register('torii-provider:linked-in-oauth2', LinkedInOauth2Provider);
  container.register('torii-provider:google-oauth2', GoogleOauth2Provider);
  container.register('torii-provider:google-oauth2-bearer', GoogleOauth2BearerProvider);
  container.register('torii-provider:facebook-connect', FacebookConnectProvider);
  container.register('torii-provider:facebook-oauth2', FacebookOauth2Provider);
  container.register('torii-provider:twitter', TwitterProvider);
  container.register('torii-provider:github-oauth2', GithubOauth2Provider);
  container.register('torii-provider:azure-ad-oauth2', AzureAdOauth2Provider);
  container.register('torii-provider:stripe-connect', StripeConnectProvider);
  container.register('torii-provider:edmodo-connect', EdmodoConnectProvider);
  container.register('torii-adapter:application', ApplicationAdapter);

  container.register('torii-service:iframe', IframeService);
  container.register('torii-service:popup', PopupService);

  var remoteServiceName = configuration.remoteServiceName || 'popup';
  if(remoteServiceName === 'iframe'){
    container.injection('torii-provider', 'popup', 'torii-service:iframe');
  }else{
    container.injection('torii-provider', 'popup', 'torii-service:popup');
  }

  if (window.DS) {
    var storeFactoryName = 'store:main';
    if (container.has('service:store')) {
      storeFactoryName = 'service:store';
    }
    container.injection('torii-provider', 'store', storeFactoryName);
    container.injection('torii-adapter', 'store', storeFactoryName);
  }

  return container;
}
