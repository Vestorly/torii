import StateMachine from 'torii/lib/state-machine';
import { set } from '@ember/object';

var transitionTo = StateMachine.transitionTo;

function copyProperties(data, target) {
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      set(target, key, data[key]);
    }
  }
}

function transitionToClearing(target, propertiesToClear) {
  return function(){
    for (var i;i<propertiesToClear.length;i++) {
      this[propertiesToClear[i]] = null;
    }
    this.transitionTo(target);
  };
}

export default function(session){
  var sm = new StateMachine({
    initialState: 'unauthenticated',

    states: {
      unauthenticated: {
        errorMessage: null,
        isAuthenticated: false,
        // Actions
        startOpen: transitionToClearing('opening', ['errorMessage']),
        startFetch: transitionToClearing('fetching', ['errorMessage'])
      },
      authenticated: {
        // Properties
        currentUser: null,
        isAuthenticated: true,
        startClose: transitionTo('closing')
      },
      opening: {
        isWorking: true,
        isOpening: true,
        // Actions
        finishOpen(data) {
          copyProperties(data, this.states['authenticated']);
          this.transitionTo('authenticated');
        },
        failOpen(errorMessage) {
          this.states['unauthenticated'].errorMessage = errorMessage;
          this.transitionTo('unauthenticated');
        }
      },
      fetching: {
        isWorking: true,
        isFetching: true,
        // Actions
        finishFetch(data) {
          copyProperties(data, this.states['authenticated']);
          this.transitionTo('authenticated');
        },
        failFetch(errorMessage) {
          this.states['unauthenticated'].errorMessage = errorMessage;
          this.transitionTo('unauthenticated');
        }
      },
      closing: {
        isWorking: true,
        isClosing: true,
        isAuthenticated: true,
        // Actions
        finishClose() {
          this.transitionTo('unauthenticated');
        },
        failClose(errorMessage) {
          this.states['unauthenticated'].errorMessage = errorMessage;
          this.transitionTo('unauthenticated');
        }
      }
    }
  });
  sm.session = session;
  return sm;
}
