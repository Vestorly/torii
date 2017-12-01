import { onLoad } from '@ember/application';

export default function(initializer) {
  onLoad('Ember.Application', function(Application){
    Application.initializer(initializer);
  });
}
