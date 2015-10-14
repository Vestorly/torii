import toriiContainer from '../../helpers/torii-container';
import QUnit from 'qunit';

let { module, test } = QUnit;

var container, registry;

module("boostrapTorii", {
  teardown: function(){
    Ember.run(container, 'destroy');
    registry = container = null;
    window.DS = null;
  }
});

test("inject popup onto providers", function(assert){
  var results = toriiContainer();
  registry = results[0];
  container = results[1];
  registry.register('torii-provider:foo', Ember.Object.extend());
  assert.ok(container.lookup('torii-provider:foo').get('popup'), 'Popup is set');
});

test("inject legacy DS store onto providers, adapters", function(assert){
  window.DS = {}; // Mock Ember-Data

  var results = toriiContainer(function(registry /*, container*/) {
    registry.register('store:main', Ember.Object.extend());
  });
  registry = results[0];
  container = results[1];

  registry.register('torii-provider:foo', Ember.Object.extend());
  var provider = container.lookup('torii-provider:foo');
  assert.ok(provider.get('store'), 'Store is set on providers');

  registry.register('torii-adapter:foo', Ember.Object.extend());
  var adapter = container.lookup('torii-adapter:foo');
  assert.ok(adapter.get('store'), 'Store is set on adapters');
});

test("inject DS store onto providers, adapters", function(assert){
  window.DS = {}; // Mock Ember-Data

  var results = toriiContainer(function(registry /*, container*/) {
    registry.register('service:store', Ember.Service.extend());
  });
  registry = results[0];
  container = results[1];

  registry.register('torii-provider:foo', Ember.Object.extend());
  var provider = container.lookup('torii-provider:foo');
  assert.ok(provider.get('store'), 'Store is set on providers');

  registry.register('torii-adapter:foo', Ember.Object.extend());
  var adapter = container.lookup('torii-adapter:foo');
  assert.ok(adapter.get('store'), 'Store is set on adapters');
});
