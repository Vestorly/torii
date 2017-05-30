import config from '../../config/environment';

const {
  torii: { sessionServiceName }
} = config;

export function stubValidSession(application, sessionData) {
  let session = application.__container__.lookup(`service:${sessionServiceName}`);

  let sm = session.get('stateMachine');
  Ember.run(() => {
    sm.send('startOpen');
    sm.send('finishOpen', sessionData);
  });
}

