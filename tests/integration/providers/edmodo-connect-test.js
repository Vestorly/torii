var torii, container, registry;

import toriiContainer from '../../helpers/torii-container';
import { configure } from 'torii/configuration';
import QUnit from 'qunit';

let { module, test } = QUnit;

var opened, mockPopup;

module('Edmodo Connect - Integration', {
  setup: function(){
    var results = toriiContainer();
    registry = results[0];
    container = results[1];
    mockPopup = {
      open: function(){
        opened = true;
        return Ember.RSVP.resolve({ access_token: 'test' });
      }
    };
    registry.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    registry.injection('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = container.lookup("service:torii");
    configure({
      providers: {
        'edmodo-connect': {
          apiKey: 'dummy',
          redirectUri: 'some url'
        }
      }
    });
  },
  teardown: function(){
    opened = false;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to Edmodo", function(assert){
  assert.expect(1);
  Ember.run(function(){
    torii.open('edmodo-connect').finally(function(){
      assert.ok(opened, "Popup service is opened");
    });
  });
});
