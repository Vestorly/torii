# WARNING :warning:
This fork is offered with absolutely **no support** and no guarantees.

# Compatibility
Ember v3.8.0+

# What is Torii?

Torii is a set of clean abstractions for authentication in [Ember.js](http://emberjs.com/)
applications. Torii is built with **providers** (authentication against a platform), a
**session manager** (for maintaining the current user), and **adapters** (to persist
authentication state).

[![Introduction to Torii](https://i.vimeocdn.com/video/545363474.jpg?mw=640&mh=360&q=70)](https://vimeo.com/146851881)

The API for providers and adapters in Torii is to **open**, by which we mean creating a new
authorization or authenticating a new session, **fetch**, by which we mean validating
an existing authorization (like a session stored in cookies), or **close**, where an
authorization is destroyed.

A provider in Torii is anything a user can authenticate against. This could be an
OAuth 2.0 endpoint, your own login mechanism, or an SDK like Facebook Connect.
Authenticating against a **provider** is done via the `torii` property, which is injected
into routes:

```hbs
{{! app/templates/post.hbs }}
{{#if hasFacebook}}
  {{partial "comment-form"}}
{{else}}
  <a href="#" {{action 'signInToComment'}}>
    Sign in to comment
  </a>
{{/if}}
```

```JavaScript
// app/routes/post.js
export default Ember.Route.extend({
  actions: {
    signInToComment: function(){
      var controller = this.controllerFor('post');
      // The provider name is passed to `open`
      this.get('torii').open('facebook-connect').then(function(authorization){
        // FB.api is now available. authorization contains the UID and
        // accessToken.
        controller.set('hasFacebook', true);
      });
    }
  }
});
```

```
torii.open('facebook') -> #open hook on the facebook provider -> returned authorization
```

## Session Management

Torii can perform **session management** via the `session` service, injected onto
routes and controllers. You can activate *session management* by specifying `sessionServiceName` in your `config/environment.js` and providing an **adapter** which Torii will use to extract session information from a new opened authorization.

This example uses Facebook's OAuth 2.0 API directly to fetch an authorization code.

```JavaScript
/* jshint node: true */
// config/environment.js
module.exports = function(environment) {
  var ENV = {
    /* ... */
    torii: {
      // a 'session' property will be injected on routes and controllers
      sessionServiceName: 'session',
      providers: {
        'facebook-oauth2': {
          apiKey:      'facebook-app-id',
          redirectUri: '/my-custom-landing-uri' // default is /torii/redirect.html
        }
      }
    }
  };
  return ENV;
};
```

```hbs
{{! app/templates/login.hbs }}
{{#if session.isWorking}}
  One sec while we get you signed in...
{{else}}
  {{error}}
  <a href="#" {{action 'signInViaFacebook'}}>
    Sign In with Facebook
  </a>
{{/if}}
```

```JavaScript
// app/routes/login.js
export default Ember.Route.extend({
  actions: {
    signInViaFacebook: function(){
      var route = this,
          controller = this.controllerFor('login');
      // The provider name is passed to `open`
      this.get('session').open('facebook-oauth2').then(function(){
        route.transitionTo('dashboard');
      }, function(error){
        controller.set('error', 'Could not sign you in: '+error.message);
      });
    }
  }
});
```

```JavaScript
// app/torii-adapters/application.js
export default Ember.Object.extend({
  open: function(authentication){
    var authorizationCode = authentication.authorizationCode;
    return new Ember.RSVP.Promise(function(resolve, reject){
      Ember.$.ajax({
        url: 'api/session',
        data: { 'facebook-auth-code': authorizationCode },
        dataType: 'json',
        success: Ember.run.bind(null, resolve),
        error: Ember.run.bind(null, reject)
      });
    }).then(function(user){
      // The returned object is merged onto the session (basically). Here
      // you may also want to persist the new session with cookies or via
      // localStorage.
      return {
        currentUser: user
      };
    });
  }
});
```

```
session.open('facebook') -> #open hook on the facebook provider -> #open hook on the application adapter -> updated session
```

Note that the adapter section is left entirely to your application.

## Router DSL

Torii includes a mechanism for specifying authenticated routes via the `Router.map` and a common implementation of authentication flow for your application.

The authentication flow is as follows:

1. In Application Route, check if the user is logged in by calling ApplicationRoute#checkLogin which calls `this.session.fetch()`.
2. When entering an authenticated route,
    Attempt to authenticate by calling `this.session.fetch()`
      If successful,
        allow the transition to finish
      otherwise,
        interrupt the transition and send "accessDenied" action

This example uses Facebook's OAuth 2.0 API and the authenticatedRoute DSL.

```JavaScript
/* jshint node: true */
// config/environment.js
module.exports = function(environment) {
  var ENV = {
    /* ... */
    torii: {
      // a 'session' property will be injected on routes and controllers
      sessionServiceName: 'session',
      providers: {
        'facebook-oauth2': {
          apiKey:      'facebook-app-id',
          redirectUri: '/my-custom-landing-uri' // default is the current URL
        }
      }
    }
  };
  return ENV;
};
```

```JavaScript
// app/router.js
Router.map(function(){
    this.authenticatedRoute('my-account');
    this.route('login');
});
```

```JavaScript
// app/routes/application.js
export default Ember.Route.extend({
  actions: {
    accessDenied: function() {
      this.transitionTo('login');
    }
  }
});
```

```JavaScript
// app/torii-adapters/application.js
export default Ember.Object.extend({
  open: function(authentication){
    var authorizationCode = authentication.authorizationCode;
    return new Ember.RSVP.Promise(function(resolve, reject){
      Ember.$.ajax({
        url: 'api/session',
        data: { 'facebook-auth-code': authorizationCode },
        dataType: 'json',
        success: Ember.run.bind(null, resolve),
        error: Ember.run.bind(null, reject)
      });
    }).then(function(user){
      // The returned object is merged onto the session (basically). Here
      // you may also want to persist the new session with cookies or via
      // localStorage.
      return {
        currentUser: user
      };
    });
  }
});
```

The session will automatically be populated if the user is logged in, otherwise the user will be redirected to the login page.

## Using Torii

Using Torii currently requires an AMD-compatible module loader. [Ember-CLI](http://www.ember-cli.com/) provide this out of the box.

### Installing Torii

Torii is an ember addon and can be installed via:

```
ember install torii
```

### Using Torii via bower

As of v0.8.0, Torii is no longer published to bower. For legacy uses, there is
an AMD build of Torii published to bower at version 0.6.1. For modern usage of
Torii, install it as an ember addon.

## Configuring a Torii provider

Now that you have added Torii to your application, you will want to
configure at least one authentication provider. Torii looks for a global
object at `window.ENV.torii.providers` that defines a hash of provider
names and their options.

**Configure a Torii provider**. Torii comes with a `facebook-connect`
provider included. To configure torii for the 'facebook-connect'
provider with ember-cli, simply add `torii` to your `config/environment.js` file:

```JavaScript
/* jshint node: true */
module.exports = function(environment) {
  var ENV = {
    /* ... */
    torii: {
      providers: {
        'facebook-connect': {
          appId: 'xxxxx-some-app-id',
          scope: 'email,user_birthday'
        }
      }
    }
  };
  return ENV;
};
```

With those values, we can authenticate the user against Facebook Connect
via the `torii` property injected onto _routes_, or the `session` property
injected onto routes and controllers (using the session management feature
will require you to write an adapter for your application – see notes on session management below).

## Using an iframe instead of a popup

You can configure torii to use an in-page iframe instead of a separate
popup window for authentication. This can be done on either a global or
a per-provider basis.

To change this globally set the `remoteServiceName` variable in the main
torii config to be `'iframe'`.

```JavaScript
/* jshint node: true */
// config/environment.js
module.exports = function(environment) {
  var ENV = {
    /* ... */
    torii: {
      remoteServiceName: 'iframe',
      providers: { /* ... */ }
    }
  };
  return ENV;
};
```

If you only want the iframe for a single provider you can include the
`remoteServiceName` value in the configuration for that provider.

```JavaScript
/* jshint node: true */
// config/environment.js
module.exports = function(environment) {
  var ENV = {
    /* ... */
    torii: {
      // a 'session' property will be injected on routes and controllers
      sessionServiceName: 'session',
      providers: {
        'mycorp-oauth2': {
          remoteServiceName: 'iframe'
          /* ... */
        }
      }
    }
  };
  return ENV;
};
```

Once your provider has been configured you need to tell torii where to
append the iframe when you call `session.open` by using the
`{{torii-iframe-placeholder}}` component. You need to make sure that
this component is added to the DOM before you call `session.open` and if
you give the user a way to back out of authentication (by closing a
modal that contains the iframe, for instance) you need to make sure that
the component is removed from the DOM so that torii will see that the
auth flow has been cancelled.

For instance, in `routes/application.js` you might have the following
`signIn` action:

```JavaScript
signIn: function() {
  var route = this;
  // Set a value that will result in the placeholder component being
  // added to the DOM
  route.controller.set('signingIn',true);
  // We need to user Ember.run.next to make sure that the placeholder
  // component has been added to the DOM before session.open is called
  Ember.run.schedule('afterRender', this, function(){
    Ember.$('#signin-modal-back').one('click',function(){
      route.controller.set('signingIn',false);
    });
    this.get("session")
      .open("clickfunnels-oauth2")
      .then(function(){
        route.controller.set('signingIn',false);
      });
  });
}
```

Then in `templates/application.hbs` you might have:

```handlebars
{{#if signingIn}}
<div id="signin-modal-back">
  <div id="signin-modal-frame">
    <div id="signin-modal-content">
      {{torii-iframe-placeholder}}
    </div>
  </div>
</div>
{{/if}}
```

## OAuth Redirects

Torii was originally configured to add an initializer that detects when your
Ember app has been redirected-to by an OAuth provider, but this has been shown
to be a potential vulnerability, and best practice is to use the static
`/torii/redirect.html` page that the Torii addon makes available as of version
0.9.0.

Therefore, **the redirect URL you register with the OAuth provider(s) that you
use should be: `<your app base URL>/torii/redirect.html`**. This is a static
HTML page that loads no external assets and is configured to interact correctly
with Torii's `provider#open` promise in your app.

Torii versions after v0.8.4 will log an error message if you do not use the
Torii-provided redirect HTML page. Using your app as the redirect target is
deprecated and the functionality will be removed in later versions of Torii.

If you understand the security risks and need to continue using your app as the
redirect target, you can disable the error message by setting
`allowUnsafeRedirects: true` in the `torii` section of your
`config/environment.js`. For more details see [this blog
post](https://medium.com/@bantic/torii-vulnerability-disclosure-dd98b6d88ec3).

By default Torii sets the `redirectUri` to
`<currentURL>/torii/redirect.html`. If you wish to use the deprecated behavior
then you will also have to manually configure the `redirectUri` to be `/`.

If you are no longer relying on the deprecated behavior and wish for it to no
longer be executed you can manually disable it by setting
`disableRedirectInitializer` to `true` in your `config/environment.js`.

## Providers in Torii

Torii is built with several providers for common cases. If you intend to
use another provider for authentication, you will need to create your
own.

### Writing a provider

Providers have a single hook, `open`, that must be implemented. It *must* return a
promise:

* `open` creates a new authorization. An example of this is logging in a
  user in with their username and password, or interfacing with an
  external OAuth provider like Facebook to retrieve authorization data.

Torii will lookup providers in the Ember application container, so if you
name them conventionally (put them in the `app/torii-providers` directory)
they will be available automatically when using ember-cli or ember app
kit.

A minimal provider:

```JavaScript
// app/torii-providers/geocities.js
export default Ember.Object.extend({
  // Create a new authorization.
  // When your code calls `this.get('torii').open('geocities', options)`,
  // the `options` will be passed to this provider's `open` method.

  open: function(options) {
    return new Ember.RSVP.Promise(function(resolve, reject){
      // resolve with an authorization object
    });
  }
});
```

Provider hooks should return a promise resolving with an authorization
object. Authorization objects should include values like access tokens, or
an Ember-Data model representing a session, or minimal user data like UIDs.
They may return SDK objects, such as an object with an API for making
authenticated calls to an API.

When used via `torii.open`, the authorization object is passed through to
the consumer. An example provider called 'geocities':

```JavaScript
// app/torii-providers/geocities.js
export default Ember.Object.extend({
  // credentials as passed from torii.open
  open: function(credentials){
    return new Ember.RSVP.Promise(function(resolve, reject){
      exampleAsyncLogin(
        credentials.username,
        credentials.password,

        // callback function:
        function(error, response) {
          // the promise is resolved with the authorization
          Ember.run.bind(null, resolve, {sessionToken: response.token});
        }
      );
    });
  }
});
```

```JavaScript
// app/routes/application.js
export default Ember.Route.extend({
  actions: {
    openGeocities: function(username, password){
      var route = this;
      var providerName = 'geocities';

      // The options to `this.get('torii').open(providerName, options)` will
      // be passed to the provider's `open` method.
      var options = {
        username: username,
        password: password
      };

      this.get('torii').open(providerName, options).then(function(authorization){
        // authorization as returned by the provider
        route.somethingWithGeocitiesToken(authorization.sessionToken);
      });
    }
  }
});
```

The cornerstone of many Torii providers is the `popup` object, which is injected
onto all providers.

### Built-in providers

Torii comes with several providers already included:

  * Github OAuth2 ([Dev Site](https://github.com/settings/applications) | [Docs](https://developer.github.com/v3/oauth/))
  * LinkedIn OAuth2 ([Dev Site](https://www.linkedin.com/secure/developer) | [Docs](http://developer.linkedin.com/))
  * Google OAuth2 ([Dev Site](https://console.developers.google.com/project) | [Docs](https://developers.google.com/accounts/docs/OAuth2WebServer))
  * Facebook Connect (via FB SDK) ([Dev Site](https://developers.facebook.com/) | [Docs](https://developers.facebook.com/docs/))
  * Facebook OAuth2 ([Dev Site](https://developers.facebook.com/) | [Docs](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow/))
  * Stripe Connect (OAuth2) ([Dev Site](https://stripe.com/docs) | [Docs](https://stripe.com/docs/connect))
  * **Authoring custom providers is designed to be easy** - You are encouraged to author your own.

### Supporting OAuth 1.0a

OAuth 1.0a, used by Twitter and some other organizations, requires a significant
server-side component and so cannot be supported out of the box. It can be implemented
following these steps:

  1. Torii provider opens a popup to the app server asking for Twitter auth
  2. Server redirects to Twitter with the credentials for login
  3. User enters their credentials at Twitter
  4. Twitter redirects to app server which completes the authentication
  5. Server loads the Ember application with a message in the URL, or otherwise
     transmits a message back to the parent window.
  6. Ember application in the initial window closes the popup and resolves its
     provider promise.

## Session Management in Torii

If you want to use torii's session management state machine, you _must_ opt in to it via the torii configuration.
Because of the potential for conflicts, **torii will not inject a `session` property** unless you explicitly ask for
it in your configuration. To do so, specify a `sessionServiceName` in your torii config.

To add a session service in Ember-CLI, simply:

```JavaScript
// config/environment.js
/* ... */
    torii: {
      // a 'session' property will be injected on routes and controllers
      sessionServiceName: 'session'
    }
/* ... */
```

Or to do the same in a global configuration

```JavaScript
window.ENV = window.ENV || {};
window.ENV['torii'] = {
  sessionServiceName: 'session', // a 'session' property will be injected on routes and controllers

  // ... additional configuration for providers, etc
};
```

Read on about adapters for more information on using torii's session management.

## Adapters in Torii

Adapters in Torii process authorizations and pass data to the session. For
example, a provider might create an authorization object from the Facebook
OAuth 2.0 API, then create a session on your applications server. The adapter
would then fetch the user and resolve with that value, adding it to the
`sessions` object.

Again, adapters are looked up on the container, and so if you name them
conventionally (put the in `app/torii-adapters/`) then they are loaded
automatically.

Adapters have three hooks that may be implemented. Each *must* return a
promise:

* `open` - a new session
* `fetch` - a refreshed session
* `close` - a closing session

Adapters are flexible, but a common use would be to fetch a current user
for the session. By default, the `application` adapter will handle all
authorizations. An example application adapter with an `open` hook:

```JavaScript
// app/torii-adapters/application.js
//
export default Ember.Object.extend({
  store: Ember.inject.service(), // inject the ember-data store

  // The authorization argument passed in to `session.open` here is
  // the result of the `torii.open(providerName)` promise
  open: function(authorization){
    var userId = authorization.user,
        store  = this.get('store');
    return store.find('user', userId).then(function(user){
      return {
        currentUser: user
      };
    });
  }
});
```

The object containing the `currentUser` is merged onto the session. Because the
session is injected onto controllers and routes, these values will be available
to templates.

Torii will first look for an adapter matching the provider name passed to
`session.open` (i.e., if you do `session.open('geocities')`, torii first looks
for an adapter at `torii-adapters/geocities`). If there is no matching adapter,
then the session object will fall back to using the `application` adapter.

## Test Helpers

For testing code that interacts with torii it can be useful to stub a
valid session. Torii inculdes a test helper for stubbing sessions during
acceptance testing.

Import the `stubValidSession` helper method.

```javascript
import { stubValidSession } from 'your-app-name/tests/helpers/torii';
```

Pass the test `application`, and a second argument that is treated like the
return value from an adapter `open` or `fetch` hook. The properties become
accessible on the session itself.

```javascript
stubValidSession(application, {
  currentUser: {
    handle: 'testguy',
    uid: 'xyz'
  }
});
```

A more complete example follows:

```javascript
import { stubValidSession } from 'your-app/tests/helpers/torii';

/* test boilerplate */

test('shows something when signed in', function(assert) {
  stubValidSession(application, {currentUser});
  visit('/');

  andThen(function() {
    // make assertions here assuming that the session is set with the object passed above...
  });
});
```
## Third-Party Addons

There are a number of ember-cli addons that allow you to use Torii with other providers:

  * [torii-provider-meetup-oauth2](https://github.com/gmurphey/torii-provider-meetup-oauth2) via @gmurphey
  * [torii-spotify](https://github.com/balinterdi/torii-spotify) via @balinterdi
  * [torii-azure-provider](https://github.com/ghurlman/torii-azure-provider) via @ghurlman
  * [torii-azure-ad2-provider](https://github.com/erikap/torii-azure-ad2-provider) via @erikap
  * [torii-provider-arcgis](https://github.com/dbouwman/torii-provider-arcgis) via @dbouwman
  * [torii-globe](https://github.com/jedld/torii-globe) via @jedld
  * [torii-edmodo-connect](https://github.com/sutori/torii-edmodo-connect) via @YoranBrondsema

## Running the tests locally

  * Clone the repo `git clone git@github.com:Vestorly/torii.git`, `cd torii/`
  * `yarn install`
  * `npm test` for tests.
  * Or, to run tests in the browser:
    * Start the server: `ember test --server`

## Running the torii examples locally

The torii example OAuth apps (at Facebook, Google, LinkedIn, etc.) are all
configured to use
`http://torii-example.com:4200/torii/redirect.html` as their redirect
uri, so you will need to make an alias in your hosts file that points
**torii-example.com** to localhost, and you must view the examples from
that same host.

To add this hostname on a Mac:
  * `sudo vim /etc/hosts`
  * Add line like this: `127.0.0.1 torii-example.com`

The `/etc/hosts` equivalent filepath on Windows is:
`%SystemRoot%\system32\drivers\etc\hosts`.

For more info, see [Hosts at wikipedia](http://en.wikipedia.org/wiki/Hosts_(file)).

  * Clone the repo `git clone git@github.com:Vestorly/torii.git`, `cd torii/`
  * `yarn` or `yarn install`
  * `ember serve`

Now, start your server and visit the page:

  * `ember serve`
  * open `http://torii-example.com:4200`

## Security

If you discover a vulnerability in Torii please inform us by emailing
security@201-created.com. You can encrypt the message using our [public
key](https://keybase.io/bantic/pgp_keys.asc).

## Release a new version

  * Bump version in package.json; commit
  * `git tag <version>`
  * `git push --tags`
  * `npm publish ./`

## How to help

*Initial development of Torii was generously funded by
[Vestorly](https://www.vestorly.com/). Vestorly is a technology company
solving the client acquisition problem for professionals in wealth
management, and the enterprises that support them. Vestorly's user
interface is built entirely with Ember.js and modern web technologies.
[hello@vestorly.com](hello@vestorly.com)*

Torii aims to provide a flexible set of primitives for creating your
application' own authentication solution. There are always a few things
we could use help with.

We welcome your contributions!
