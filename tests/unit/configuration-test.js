import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { configurable, configure } from 'torii/configuration';
import { module, test } from 'qunit';

module('Unit | Configuration', function(hooks) {
  let testable;

  const Testable = EmberObject.extend({
    name: 'test',
    required: configurable('apiKey'),
    defaulted: configurable('scope', 'email'),
    defaultedFunctionValue: 'found-via-get',
    defaultedFunction: configurable('redirectUri', function(){
      return this.get('defaultedFunctionValue');
    }),
  });

  hooks.beforeEach(function() {
    testable = Testable.create();
  });

  hooks.afterEach(function() {
    run(testable, 'destroy');
  });

  test("it should throw when reading a value not defaulted", function(assert){
    let threw = false;
    let message;

    configure({
      providers: {
        test: {}
      }
    });

    try {
      testable.get('required');
    } catch (e) {
      threw = true;
      message = e.message;
    }

    assert.ok(threw, 'read threw');
    assert.ok(/Expected configuration value apiKey to be defined for provider named test/.test(message), 'did not have proper error: '+message);
  });

  test("it should read values", function(assert){
    configure({
      providers: {
        test: {
          apiKey: 'item val'
        }
      }
    });

    const value = testable.get('required');

    assert.equal(value, 'item val');
  });

  test("it should read default values", function(assert){
    configure({
      providers: {
        test: { apiKey: 'item val' }
      }
    });

    const value = testable.get('defaulted');

    assert.equal(value, 'email');
  });

  test("it should override default values", function(assert){
    configure({
      providers: {
        test: {
          scope: 'baz'
        }
      }
    });

    const value = testable.get('defaulted');

    assert.equal(value, 'baz');
  });

  test("it read default values from a function", function(assert){
    const value = testable.get('defaultedFunction');

    assert.equal(value, 'found-via-get');
  });
});
