var torii, container, registry;

import buildFBMock from '../../helpers/build-fb-mock';
import toriiContainer from '../../helpers/torii-container';
import { configure } from 'torii/configuration';
import QUnit from 'qunit';

let { module, test } = QUnit;

var originalGetScript = $.getScript,
    originalFB = window.FB;
var providerConfiguration;

module('Facebook Connect - Integration', {
  setup: function(){
    var results = toriiContainer();
    registry = results[0];
    container = results[1];
    torii = container.lookup('service:torii');
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
  teardown: function(){
    window.FB = originalFB;
    $.getScript = originalGetScript;
    Ember.run(container, 'destroy');
  }
});

test("Opens facebook connect session", function(assert){
  $.getScript = function(){
    window.fbAsyncInit();
  };
  Ember.run(function(){
    torii.open('facebook-connect').then(function(){
      assert.ok(true, "Facebook connect opened");
    }, function(e){
      assert.ok(false, "Facebook connect failed to open: " + e.message);
    });
  });
});

test("Returns the scopes granted when configured", function(assert){
  $.getScript = function(){
    window.fbAsyncInit();
  };
  configure({
    providers: {
      'facebook-connect': Ember.merge(providerConfiguration, {returnScopes: true})
    }
  });
  Ember.run(function(){
    torii.open('facebook-connect').then(function(data){
      assert.equal('email', data.grantedScopes);
    });
  });
});

test("Supports custom auth_type on login", function(assert){
  $.getScript = function(){
    window.fbAsyncInit();
  };
  Ember.run(function(){
    torii.open('facebook-connect', {authType: 'rerequest'}).then(function(data){
      assert.equal(5678, data.expiresIn, 'expriesIn extended when rerequest found');
    });
  });
});
