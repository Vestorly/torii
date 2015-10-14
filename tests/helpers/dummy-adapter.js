import Ember from 'ember';

var dummyUser = Ember.Object.create({
  email: 'someUser@example.com'
});

export default Ember.Object.extend({
  open: function(){
    return Ember.RSVP.resolve({
      currentUser: dummyUser
    });
  },
  fetch: function(){
    return Ember.RSVP.resolve({
      currentUser: dummyUser
    });
  }
});
