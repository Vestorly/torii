function requiredProperty(){
  return Ember.computed(function(key){
    throw new Error("Definition of property "+key+" by a subclass is required.");
  });
}

export default requiredProperty;
