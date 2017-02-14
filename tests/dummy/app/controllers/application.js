import Ember from 'ember';

export default Ember.Controller.extend({
  authData: {},

  authDataStr: Ember.computed('authData', function () {
    return JSON.stringify(this.get('authData'), null, 2);
  })
});
