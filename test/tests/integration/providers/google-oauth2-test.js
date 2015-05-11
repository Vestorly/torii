var torii, container;

import toriiContainer from 'test/helpers/torii-container';
import configuration from 'torii/configuration';

var originalConfiguration = configuration.providers['google-oauth2'];

var opened, mockPopup;

module('Google - Integration', {
  setup: function(){
    mockPopup = {
      open: function(){
        opened = true;
        return Ember.RSVP.resolve({ code: 'test' });
      }
    };
    container = toriiContainer();
    container.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    container.injection('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = container.lookup("torii:main");
    configuration.providers['google-oauth2'] = {apiKey: 'dummy'};
  },
  teardown: function(){
    opened = false;
    configuration.providers['google-oauth2'] = originalConfiguration;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to Google", function(){
  Ember.run(function(){
    torii.open('google-oauth2').finally(function(){
      ok(opened, "Popup service is opened");
    });
  });
});

test("Opens a popup to Google with request_visible_actions", function(){
  expect(1);
  configuration.providers['google-oauth2'].requestVisibleActions = "http://some-url.com";
  mockPopup.open = function(url){
    ok(
      url.indexOf("request_visible_actions=http%3A%2F%2Fsome-url.com") > -1,
      "request_visible_actions is present" );
    return Ember.RSVP.resolve({ code: 'test' });
  }
  Ember.run(function(){
    torii.open('google-oauth2');
  });
});

test("Opens a popup to Google with access_type parameter", function(){
  expect(1);
  configuration.providers['google-oauth2'].accessType = "offline";
  mockPopup.open = function(url){
    ok(
      url.indexOf("access_type=offline") > -1,
      "access_type parameter is present" );
    return Ember.RSVP.resolve({ code: 'test' });
  }
  Ember.run(function(){
    torii.open('google-oauth2');
  });
});

test("Opens a popup to Google with hd parameter", function(){
  expect(1);
  configuration.providers['google-oauth2'].hd = "google.com";
  mockPopup.open = function(url){
    ok(
      url.indexOf("hd=google.com") > -1,
      "hd parameter is present" );
    return Ember.RSVP.resolve({ code: 'test' });
  }
  Ember.run(function(){
    torii.open('google-oauth2');
  });
});
