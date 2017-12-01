import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import OAuth1Provider from 'torii/providers/oauth1';
import { configure } from 'torii/configuration';
import startApp from '../../helpers/start-app';
import lookup from '../../helpers/lookup';
import QUnit from 'qunit';

const { module, test } = QUnit;

var torii, app;

var opened, openedUrl, mockPopup = {
  open(url) {
    openedUrl = url;
    opened = true;
    return resolve({});
  }
};

var requestTokenUri = 'http://localhost:3000/oauth/callback';
var providerName = 'oauth1';

module('Integration | Provider | Oauth1', {
  beforeEach() {
    app = startApp({loadInitializers: true});
    app.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    app.inject('torii-provider', 'popup', 'torii-service:mock-popup');

    app.register('torii-provider:'+providerName, OAuth1Provider);

    torii = lookup(app, "service:torii");
    configure({
      providers: {
        [providerName]: {
          requestTokenUri: requestTokenUri
        }
      }
    });
  },
  afterEach() {
    opened = false;
    run(app, 'destroy');
  }
});

test("Opens a popup to the requestTokenUri", function(assert){
  run(function(){
    torii.open(providerName).finally(function(){
      assert.equal(openedUrl, requestTokenUri, 'opens with requestTokenUri');
      assert.ok(opened, "Popup service is opened");
    });
  });
});
