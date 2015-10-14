/* global Ember */
export default function(initializer){
  Ember.onLoad('Ember.Application', function(Application){
    Application.initializer(initializer);
  });
}
