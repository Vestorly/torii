import { setupTest } from 'ember-qunit';
import { configure } from 'torii/configuration';
import { module, test } from 'qunit';
import MockPopupService from '../../helpers/mock-popup-service';

module('Integration | Provider | Stripe Connect', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    configure({
      providers: {
        'stripe-connect': { apiKey: 'dummy' }
      }
    });
  });

  test("Opens a popup to Stripe", function(assert){
    const torii = this.owner.lookup('service:torii');
    const mockPopup = MockPopupService.create();

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open('stripe-connect').finally(function(){
      assert.ok(mockPopup.opened, "Popup service is opened");
    });
  });

  test('Validates the state parameter in the response', function(assert){
    const torii = this.owner.lookup('service:torii');
    const mockPopup = MockPopupService.create({ state: 'invalid-state' });

    this.owner.register('torii-service:popup', mockPopup, {instantiate: false});

    return torii.open('stripe-connect').then(null, function(e){
      assert.ok(/has an incorrect session state/.test(e.message),
          'authentication fails due to invalid session state response');
    });
  });
});
