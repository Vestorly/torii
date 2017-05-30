import Ember from 'ember';
import config from '../config/environment';

export default Ember.Controller.extend({
  torii: Ember.inject.service(),

  providers: Ember.computed(function() {
    return Ember.A(Object.keys(config.torii.providers));
  }),

  actions: {
    authorize(provider) {
      this.setProperties({
        error: null,
        authData: null
      });

      this.get('torii').open(provider).then(authData => {
        this.set('authData', authData);
      }, (e) => {
        this.set('error', e);
      });
    }
  }
});
