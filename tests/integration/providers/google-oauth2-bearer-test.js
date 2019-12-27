import { setupTest } from 'ember-qunit';
import { configure } from 'torii/configuration';
import { module, test } from 'qunit';

import MockPopupService from '../../helpers/mock-popup-service';

const providerConfig = { apiKey: 'dummy' };

module('Integration | Provider | Google Bearer', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    configure({
      providers: {
        'google-oauth2-bearer': providerConfig
      }
    });
  });

  test("Opens a popup to Google", function(assert){
    assert.expect(1);

    class GooglePopupService extends MockPopupService {
      async open () {
        super.open(...arguments);
        return { access_token: 'test' };
      }
    }

    const torii = this.owner.lookup('service:torii');
    const mockPopup = GooglePopupService.create();

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open('google-oauth2-bearer').finally(function(){
      assert.ok(mockPopup.opened, "Popup service is opened");
    });
  });

  test("Opens a popup to Google with request_visible_actions", function(assert){
    assert.expect(1);

    configure({
      providers: {
        'google-oauth2-bearer': Object.assign(
          {},
          providerConfig,
          {
            requestVisibleActions: "http://some-url.com"
          }
        )
      }
    });

    class GooglePopupService extends MockPopupService {
      async open (url) {
        assert.ok(
          url.indexOf("request_visible_actions=http%3A%2F%2Fsome-url.com") > -1,
          "request_visible_actions is present" );
        return { access_token: 'test' };
      }
    }

    const torii = this.owner.lookup('service:torii');
    const mockPopup = GooglePopupService.create({});

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open('google-oauth2-bearer');
  });

});

