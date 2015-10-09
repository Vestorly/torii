import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    signIn(providerName) {
      this.get('torii').open(providerName).then(authData => {
        console.log('authData',authData);
      }).catch(err => {
        console.log('err',err);
      });
    }
  }
});
