import { run } from '@ember/runloop';
var torii, app;

import { configure } from 'torii/configuration';
import MockPopup from '../../helpers/mock-popup';
import startApp from '../../helpers/start-app';
import lookup from '../../helpers/lookup';
import QUnit from 'qunit';

const { module, test } = QUnit;

var mockPopup = new MockPopup();

var failPopup = new MockPopup({ state: 'invalid-state' });

module('Integration | Provider | Google', {
  beforeEach() {
    app = startApp({loadInitializers: true});
    app.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    app.register('torii-service:fail-popup', failPopup, {instantiate: false});
    app.inject('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = lookup(app, "service:torii");
    configure({
      providers: {
        'google-oauth2': { apiKey: 'dummy' }
      }
    });
  },
  afterEach() {
    mockPopup.opened = false;
    run(app, 'destroy');
  }
});

test("Opens a popup to Google", function(assert){
  run(function(){
    torii.open('google-oauth2').finally(function(){
      assert.ok(mockPopup.opened, "Popup service is opened");
    });
  });
});

test('Validates the state parameter in the response', function(assert){
  app.inject('torii-provider', 'popup', 'torii-service:fail-popup');

  run(function(){
    torii.open('google-oauth2').then(null, function(e){
      assert.ok(/has an incorrect session state/.test(e.message),
         'authentication fails due to invalid session state response');
    });
  });
});
