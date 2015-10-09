/* global Ember */
export default function(instanceInitializer){
  Ember.onLoad('Ember.Application', function(Application){
    Application.instanceInitializer(instanceInitializer);
  });
}
