import Torii from 'torii/torii';
import LinkedInOauth2Provider from 'torii/providers/linked-in-oauth2';
import GoogleOauth2Provider from 'torii/providers/google-oauth2';
import FacebookConnectProvider from 'torii/providers/facebook-connect';
import FacebookOauth2Provider from 'torii/providers/facebook-oauth2';
import ApplicationAdapter from 'torii/adapters/application';
import TwitterProvider from 'torii/providers/twitter-oauth1';
import GithubOauth2Provider from 'torii/providers/github-oauth2';
import OutlookOauth2 from 'torii/providers/outlook-oauth2';

import PopupService from 'torii/services/popup';

export default function(container){
  container.register('torii:main', Torii);
  container.register('torii-provider:linked-in-oauth2', LinkedInOauth2Provider);
  container.register('torii-provider:google-oauth2', GoogleOauth2Provider);
  container.register('torii-provider:facebook-connect', FacebookConnectProvider);
  container.register('torii-provider:facebook-oauth2', FacebookOauth2Provider);
  container.register('torii-provider:twitter', TwitterProvider);
  container.register('torii-provider:github-oauth2', GithubOauth2Provider);
  container.register('torii-provider:outlook-oauth2', OutlookOauth2);
  container.register('torii-adapter:application', ApplicationAdapter);

  container.register('torii-service:popup', PopupService);

  container.injection('torii-provider', 'popup', 'torii-service:popup');

  if (window.DS) {
    container.injection('torii-provider', 'store', 'store:main');
    container.injection('torii-adapter', 'store', 'store:main');
  }

  return container;
}
