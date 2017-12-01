import { run } from '@ember/runloop';
import config from '../../config/environment';

const {
  torii: { sessionServiceName }
} = config;

export function stubValidSession(application, sessionData) {
  let session = application.__container__.lookup(`service:${sessionServiceName}`);

  let sm = session.get('stateMachine');
  run(() => {
    sm.send('startOpen');
    sm.send('finishOpen', sessionData);
  });
}

