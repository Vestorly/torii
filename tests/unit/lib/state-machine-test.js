import StateMachine from 'torii/lib/state-machine';
import QUnit from 'qunit';

let { module, test } = QUnit;

module('State Machine - Unit', {
  setup: function(){
  }
});

test("can transition from one state to another", function(assert){
  var sm = new StateMachine({
    initialState: 'initial',
    states: {
      initial: {
        foo: 'bar'
      },
      started: {
        baz: 'blah'
      }
    }
  });

  assert.equal(sm.currentStateName, 'initial');
  assert.equal(sm.state.foo, 'bar');
  assert.ok(!sm.state.baz, 'has no baz state when initial');

  sm.transitionTo('started');
  assert.equal(sm.currentStateName, 'started');
  assert.equal(sm.state.baz, 'blah');
  assert.ok(!sm.state.foo, 'has no foo state when started');
});
