import { A } from '@ember/array';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

import config from '../config/environment';

export default Controller.extend({
  torii: service(),

  providers: computed(function() {
    return A(Object.keys(config.torii.providers));
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
