import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
var torii, app;

import startApp from '../../helpers/start-app';
import lookup from '../../helpers/lookup';
import { configure } from 'torii/configuration';
import QUnit from 'qunit';

const { module, test } = QUnit;

var opened, mockPopup;

module('Integration | Provider | Edmodo Connect', {
  beforeEach() {
    app = startApp({loadInitializers: true});
    mockPopup = {
      open() {
        opened = true;
        return resolve({ access_token: 'test' });
      }
    };
    app.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    app.inject('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = lookup(app, "service:torii");

    configure({
      providers: {
        'edmodo-connect': {
          apiKey: 'dummy',
          redirectUri: 'some url'
        }
      }
    });
  },
  afterEach() {
    opened = false;
    run(app, 'destroy');
  }
});

test("Opens a popup to Edmodo", function(assert){
  assert.expect(1);
  run(function(){
    torii.open('edmodo-connect').finally(function(){
      assert.ok(opened, "Popup service is opened");
    });
  });
});
