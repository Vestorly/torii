import { onLoad } from '@ember/application';

export default function(instanceInitializer) {
  onLoad('Ember.Application', function(Application){
    Application.instanceInitializer(instanceInitializer);
  });
}
