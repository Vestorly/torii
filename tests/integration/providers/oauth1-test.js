import { setupTest } from 'ember-qunit';
import { configure } from 'torii/configuration';
import { module, test } from 'qunit';

import OAuth1Provider from 'torii/providers/oauth1';
import MockPopupService from '../../helpers/mock-popup-service';

const requestTokenUri = 'http://localhost:3000/oauth/callback';
const providerName = 'oauth1';

module('Integration | Provider | Oauth1', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.register('torii-provider:'+providerName, OAuth1Provider);

    configure({
      providers: {
        [providerName]: {
          requestTokenUri: requestTokenUri
        }
      }
    });
  });

  test("Opens a popup to the requestTokenUri", function(assert){
    class MyPopupService extends MockPopupService {
      async open(url) {
        const result = super.open(...arguments);

        assert.equal(url, requestTokenUri, 'opens with requestTokenUri');

        return result;
      }
    }

    const mockPopup = MyPopupService.create();
    const torii = this.owner.lookup('service:torii');

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open(providerName).finally(function() {
      assert.ok(mockPopup.opened, "Popup service is opened");
    });
  });
});
