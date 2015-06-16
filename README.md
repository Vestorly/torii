[![Torii Build Status](https://circleci.com/gh/Vestorly/torii.png?circle-token=9bdd2f37dbcb0be85f82a6b1ac61b9333b68625b "Torii Build Status")](https://circleci.com/gh/Vestorly/torii) [![Ember Observer Score](http://emberobserver.com/badges/torii.svg)](http://emberobserver.com/addons/torii)

Torii is a set of clean abstractions for authentication in [Ember.js](http://emberjs.com/)
applications. Torii is built with **providers** (authentication against a platform), a
**session manager** (for maintaining the current user), and **adapters** (to persist
authentication state).

The API for providers and adapters in Torii is to **open**, by which we mean creating a new
authorization or authenticating a new session, **fetch**, by which we mean validating
an existing authorization (like a session stored in cookies), or **close**, where an
authorization is destroyed.

A provider in Torii is anything a user can authenticate against. This could be an
OAuth 2.0 endpoint, your own login mechanism, or an SDK like Facebook Connect.
Authenticating against a **provider** is done via the `torii` property, which is injected
on to routes:

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

This is authentication only against a provider. If your application provides
an **adapter**, then Torii can also perform **session management** via the
`session` property, injected onto routes and controllers. This example uses
Facebook's OAuth 2.0 API directly to fetch an authorization code.

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

## Using Torii

Using Torii currently requires an AMD-compatible module loader. [Ember-CLI](http://www.ember-cli.com/) provide this out of the box.

### Using Torii as an ember-addon

Torii is configured to be compatible with the ember-cli
[ember-addon](http://reefpoints.dockyard.com/2014/06/24/introducing_ember_cli_addons.html)
functionality, as of ember-cli version 0.0.37.

If you are using ember-cli at version 0.0.37 or later, you can simply install the torii npm module:

`npm install torii --save-dev`

The ember-addon hooks will include torii into your app and add its
initializers.

### Using Torii via bower

Torii is also published as a bower package (as named amd modules).
Install via bower:

`bower install torii`

Next, **add Torii to your build pipeline**. In Ember-App-Kit you do this
in `app/index.html`. In Ember-CLI, you add the package to the `Brocfile.js`:

```
// Your path to torii may be different than the one below, depending on
// your bower configuration.
app.import('vendor/torii/dist/torii.amd.js');
```

**Add Torii's intialization code to your app**. Torii exports an amd module named `torii/load-initializers`, which will
add the appropriate application initializers to do Torii's container registrations and injections.
You will want to add `require('torii/load-initializers')['default']();` to your `app.js` file after you've defined your app
and before you've created it.
Here is an [example app.js](https://gist.github.com/bantic/b86787ed315c5ef98323).

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

For a non-ember-cli application, you can set the same values on `ENV`:

```JavaScript
// In Ember-App-Kit you will set this in app/index.html
window.ENV = window.ENV || {};
window.ENV['torii'] = {
  providers: {
    'facebook-connect': {
      appId: 'xxxxx-some-app-id',
      scope: 'email,user_birthday'
    }
  }
};
```

With those values, we can authenticate the user against Facebook Connect
via the `torii` property injected onto _routes_, or the `session` property
injected onto routes and controllers (using the session management feature
will require you to write an adapter for your application – see notes on session management below).

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
  // create a new authorization
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
      // argument to open is passed into the provider
      this.get('torii').open(providerName, {
        username: username,
        password: password
      }).then(function(authorization){
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
// Here we will presume the store has been injected onto torii-adapter
// factories. You would do this with an initializer, e.g.:
//
// application.inject('torii-adapter', 'store', 'store:application');
//
export default Ember.Object.extend({

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

## Running the tests locally

  * Clone the repo `git clone git@github.com:Vestorly/torii.git`, `cd torii/`
  * `npm install`, which will also run `bower install`
  * `grunt test` for tests.
  * Or, to run tests in the browser:
    * Start the server: `grunt server`
    * Open [http://localhost:8000/test/](http://localhost:8000/test/)

## Running the torii examples locally

  * Clone the repo `git clone git@github.com:Vestorly/torii.git`, `cd torii/`
  * `npm install`, which will also run `bower install`

The torii example apps (at facebook, google, linkedin, etc) are all
configured to use
`http://torii-example.com:8000/example/basic.html` as their redirect
uri, so you will need to make an alias in your hosts file that points
**torii-example.com** to localhost, and you must view the examples from
that same host.

To add this hostname on a Mac:
  * `sudo vim /etc/hosts`
  * Add line like this: `127.0.0.1 torii-example.com`

The `/etc/hosts` equivalent filepath on Windows is:
`%SystemRoot%\system32\drivers\etc\hosts`.

For more info, see [Hosts at wikipedia](http://en.wikipedia.org/wiki/Hosts_(file)).

Now, start your server and visit the page:

  * `grunt server`
  * open `http://torii-example.com/example/basic.html`

## Generate docs

Use [YUIDoc](http://yui.github.io/yuidoc/).

  * Install: `npm install -g yuidocjs`
  * Generate: `yuidoc lib/`
  * Output will be put into "docs/"

## Release a new version

  * Bump version in package.json
  * Bump version in bower.json
  * `grunt build-release`
  * Force commit new/changed files in dist/
  * Commit changed bower.json, package.json
  * `git tag <version>`
  * `git push --tags`
  * Publishing a version git tag will automatically register a new bower
    version
  * To publish the updated npm module, `npm publish ./`

## How to help

*Initial development of Torii was generously funded by
[Vestorly](https://www.vestorly.com/). Vestorly is a technology company
solving the client acquisition problem for professionals in wealth
management, and the enterprises that support them. Vestorly's user
interface is built entirely with Ember.js and modern web technologies.
[hello@vestorly.com](hello@vestorly.com)*

Torii aims to provide a flexible set of primitives for creating your
application' own authentication solution. There are still a few things
we could use help with:

* A non-AMD build of the code
* More testing of sessions
* More documentation
* Publish your own provider or adapter implementation!

We welcome your contributions.
