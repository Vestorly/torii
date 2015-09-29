var torii, container, registry;

import toriiContainer from 'test/helpers/torii-container';
import configuration from 'torii/configuration';
import MockPopup from 'test/helpers/mock-popup';

var originalConfiguration = configuration.providers['tradier-oauth2'];

var mockPopup = new MockPopup();

var failPopup = new MockPopup({
    state: 'invalid-state'
});

module('Tradier - Integration', {
    setup: function() {
        var results = toriiContainer();
        registry = results[0];
        container = results[1];
        registry.register('torii-service:mock-popup', mockPopup, {
            instantiate: false
        });
        registry.register('torii-service:fail-popup', failPopup, {
            instantiate: false
        });
        registry.injection('torii-provider', 'popup', 'torii-service:mock-popup');

        torii = container.lookup("service:torii");
        configuration.providers['tradier-oauth2'] = {
            apiKey: 'dummy'
        };
    },
    teardown: function() {
        mockPopup.opened = false;
        configuration.providers['tradier-oauth2'] = originalConfiguration;
        Ember.run(container, 'destroy');
    }
});

test("Opens a popup to Tradier", function() {
    Ember.run(function() {
        torii.open('tradier-oauth2').finally(function() {
            ok(mockPopup.opened, "Popup service is opened");
        });
    });
});

test('Validates the state parameter in the response', function() {
    registry.injection('torii-provider', 'popup', 'torii-service:fail-popup');

    Ember.run(function() {
        torii.open('tradier-oauth2').then(null, function(e) {
            ok(/has an incorrect session state/.test(e.message),
                'authentication fails due to invalid session state response');
        });
    });
});
