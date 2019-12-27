import { setupTest } from 'ember-qunit';
import { configure } from 'torii/configuration';
import { module, test } from 'qunit';

import MockPopupService from '../../helpers/mock-popup-service';

module('Integration | Provider | Facebook OAuth2', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    configure({
      providers: {
        'facebook-oauth2': { apiKey: 'dummy' }
      }
    });
  });

  test("Opens a popup to Facebook", function(assert){
    const torii = this.owner.lookup('service:torii');
    const mockPopup = MockPopupService.create();

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open('facebook-oauth2').finally(function(){
      assert.ok(mockPopup.opened, "Popup service is opened");
    });
  });

  test("Resolves with an authentication object containing 'redirectUri'", function(assert){
    const torii = this.owner.lookup('service:torii');
    const mockPopup = MockPopupService.create();

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open('facebook-oauth2').then(function(data){
      assert.ok(data.redirectUri,
          'Object has redirectUri');
    }, function(err){
      assert.ok(false, 'Failed with err '+err);
    });
  });

  test('Validates the state parameter in the response', function(assert){
    const torii = this.owner.lookup('service:torii');
    const mockPopup = MockPopupService.create({ state: 'invalid-state' });

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open('facebook-oauth2').then(null, function(e){
      assert.ok(/has an incorrect session state/.test(e.message),
          'authentication fails due to invalid session state response');
    });
  });
});
