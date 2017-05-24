import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    signIn(providerName) {
      this.get('torii').open(providerName).then((authData) => {
        this.controller.set('authData', authData);
        console.log('authData', authData);
      }).catch((err) => {
        console.log('err', err);
      });
    }
  }
});
