var torii, app;

import { configure } from 'torii/configuration';
import startApp from '../../helpers/start-app';
import lookup from '../../helpers/lookup';
import QUnit from 'qunit';

const { module, test } = QUnit;

var opened, mockPopup, providerConfig;

module('Integration | Provider | Google Bearer', {
  beforeEach() {
    mockPopup = {
      open: function(){
        opened = true;
        return Ember.RSVP.resolve({ access_token: 'test' });
      }
    };
    app = startApp({loadInitializers: true});
    app.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    app.inject('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = lookup(app, "service:torii");
    providerConfig = { apiKey: 'dummy' };
    configure({
      providers: {
        'google-oauth2-bearer': providerConfig
      }
    });
  },
  afterEach() {
    opened = false;
    Ember.run(app, 'destroy');
  }
});

test("Opens a popup to Google", function(assert){
  assert.expect(1);
  Ember.run(function(){
    torii.open('google-oauth2-bearer').finally(function(){
      assert.ok(opened, "Popup service is opened");
    });
  });
});

test("Opens a popup to Google with request_visible_actions", function(assert){
  assert.expect(1);
  configure({
    providers: {
      'google-oauth2-bearer': Ember.merge(providerConfig, {
        requestVisibleActions: "http://some-url.com"
      })
    }
  });
  mockPopup.open = function(url){
    assert.ok(
      url.indexOf("request_visible_actions=http%3A%2F%2Fsome-url.com") > -1,
      "request_visible_actions is present" );
    return Ember.RSVP.resolve({ access_token: 'test' });
  };
  Ember.run(function(){
    torii.open('google-oauth2-bearer');
  });
});
