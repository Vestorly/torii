import { assign } from '@ember/polyfills';
import { run } from '@ember/runloop';
import buildFBMock from '../../helpers/build-fb-mock';
import { configure } from 'torii/configuration';
import startApp from '../../helpers/start-app';
import lookup from '../../helpers/lookup';
import QUnit from 'qunit';
import { overrideLoadScript, resetLoadScript } from 'torii/providers/-private/utils';
const { module, test } = QUnit;

var originalFB = window.FB;
let providerConfiguration;

var torii, app;

module('Integration | Provider | Facebook Connect', {
  beforeEach() {
    app = startApp({ loadInitializers: true });
    torii = lookup(app, 'service:torii');
    providerConfiguration = {
      appId: 'dummy'
    };
     configure({
      providers: {
        'facebook-connect': providerConfiguration
      }
    });
    window.FB = buildFBMock();
  },
  afterEach() {
    window.FB = originalFB;
    resetLoadScript();
    run(app, 'destroy');
  }
});

test("Opens facebook connect session", function(assert){
  overrideLoadScript(function(){
    window.fbAsyncInit();
  });
  run(function(){
    torii.open('facebook-connect').then(function(){
      assert.ok(true, "Facebook connect opened");
    }, function(e){
      assert.ok(false, "Facebook connect failed to open: " + e.message);
    });
  });
});

test("Returns the scopes granted when configured", function(assert){
  overrideLoadScript(function(){
    window.fbAsyncInit();
  });
  configure({
    providers: {
      'facebook-connect': assign(providerConfiguration, {returnScopes: true})
    }
  });
  run(function(){
    torii.open('facebook-connect').then(function(data){
      assert.equal('email', data.grantedScopes);
    });
  });
});

test("Supports custom auth_type on login", function(assert){
  overrideLoadScript(function(){
    window.fbAsyncInit();
  });
  run(function(){
    torii.open('facebook-connect', {authType: 'rerequest'}).then(function(data){
      assert.equal(5678, data.expiresIn, 'expriesIn extended when rerequest found');
    });
  });
});
