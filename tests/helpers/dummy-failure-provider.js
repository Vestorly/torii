/**
 * This class emulates a failed authentication.
 */

export default Ember.Object.extend({

  open: function(){
    return Ember.RSVP.reject("Dummy authentication failure");
  }

});
