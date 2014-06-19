import createStateMachine from 'torii/session/state-machine';

function lookupAdapter(container, authenticationType){
  var adapter = container.lookup('torii-adapter:'+authenticationType);
  if (!adapter) {
    adapter = container.lookup('torii-adapter:application');
  }
  return adapter;
}

var Session = Ember.ObjectProxy.extend({
  state: null,

  stateMachine: function(){
    return createStateMachine(this);
  }.property(),

  setupStateProxy: function(){
    var sm    = this.get('stateMachine'),
        proxy = this;
    sm.on('didTransition', function(){
      proxy.set('content', sm.state);
      proxy.set('currentStateName', sm.currentStateName);
    });
  }.on('init'),

  // Make these properties one-way.
  setUnknownProperty: Ember.K,

  open: function(provider, options){
    var container = this.container,
        torii     = this.get('torii'),
        sm        = this.get('stateMachine');

    return new Ember.RSVP.Promise(function(resolve){
      sm.send('startOpen');
      resolve();
    }).then(function(){
      return torii.open(provider, options);
    }).then(function(authorization){
      var adapter = lookupAdapter(
        container, provider
      );

      return adapter.open(authorization);
    }).then(function(user){
      sm.send('finishOpen', user);
      return user;
    }).catch(function(error){
      sm.send('failOpen', error);
      return Ember.RSVP.reject(error);
    });
  },

  fetch: function(provider, options){
    var container = this.container,
        sm        = this.get('stateMachine');

    return new Ember.RSVP.Promise(function(resolve){
      sm.send('startFetch');
      resolve();
    }).then(function(){
      var adapter = lookupAdapter(
        container, provider
      );

      return adapter.fetch(options);
    }).then(function(data){
      sm.send('finishFetch', data);
      return;
    }).catch(function(error){
      sm.send('failFetch', error);
      return Ember.RSVP.reject(error);
    });
  },

  close: function(){
    var container = this.container,
        sm        = this.get('stateMachine');

    return new Ember.RSVP.Promise(function(resolve){
      sm.send('startClose');
      resolve();
    }).then(function(){
      var adapter = lookupAdapter(container);
      return adapter.close();
    }).then(function(){
      sm.send('finishClose');
    }).catch(function(error){
      sm.send('failClose', error);
      return Ember.RSVP.reject(error);
    });
  }

});

export default Session;
