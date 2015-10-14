/**
 * This class emulates a successful authentication, returning
 * a dummy authorization object.
 */

export default Ember.Object.extend({

  open: function(authorization){
    return Ember.RSVP.Promise.resolve(authorization);
  }

});
