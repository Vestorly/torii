import OAuth1Provider from 'torii/providers/oauth1';
import toriiContainer from '../../helpers/torii-container';
import { configure } from 'torii/configuration';
import QUnit from 'qunit';

let { module, test } = QUnit;

var torii, container, registry;

var opened, openedUrl, mockPopup = {
  open: function(url){
    openedUrl = url;
    opened = true;
    return Ember.RSVP.resolve({});
  }
};

var requestTokenUri = 'http://localhost:3000/oauth/callback';
var providerName = 'oauth1';

module('Oauth1 - Integration', {
  setup: function(){
    var results = toriiContainer();
    registry = results[0];
    container = results[1];
    registry.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    registry.injection('torii-provider', 'popup', 'torii-service:mock-popup');

    registry.register('torii-provider:'+providerName, OAuth1Provider);

    torii = container.lookup("service:torii");
    configure({
      providers: {
        [providerName]: {
          requestTokenUri
        }
      }
    });
  },
  teardown: function(){
    opened = false;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to the requestTokenUri", function(assert){
  Ember.run(function(){
    torii.open(providerName).finally(function(){
      assert.equal(openedUrl, requestTokenUri, 'opens with requestTokenUri');
      assert.ok(opened, "Popup service is opened");
    });
  });
});
