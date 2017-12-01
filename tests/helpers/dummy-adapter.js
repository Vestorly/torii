import { resolve } from 'rsvp';
import EmberObject from '@ember/object';

var dummyUser = EmberObject.create({
  email: 'someUser@example.com'
});

export default EmberObject.extend({
  open() {
    return resolve({
      currentUser: dummyUser
    });
  },
  fetch() {
    return resolve({
      currentUser: dummyUser
    });
  }
});
