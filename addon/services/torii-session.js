import Ember from 'ember';
import { Promise as EmberPromise, reject } from 'rsvp';
import Service from '@ember/service';
import { on } from '@ember/object/evented';
import { computed } from '@ember/object';
import createStateMachine from 'torii/session/state-machine';
import { getOwner } from 'torii/lib/container-utils';

function lookupAdapter(container, authenticationType){
  var adapter = container.lookup('torii-adapter:'+authenticationType);
  if (!adapter) {
    adapter = container.lookup('torii-adapter:application');
  }
  return adapter;
}

export default Service.extend(Ember._ProxyMixin, {
  state: null,

  stateMachine: computed(function(){
    return createStateMachine(this);
  }),

  setupStateProxy: on('init', function(){
    var sm    = this.get('stateMachine'),
        proxy = this;
    sm.on('didTransition', function(){
      proxy.set('content', sm.state);
      proxy.set('currentStateName', sm.currentStateName);
    });
  }),

  // Make these properties one-way.
  setUnknownProperty() {},

  open(provider, options) {
    var owner     = getOwner(this),
        torii     = getOwner(this).lookup('service:torii'),
        sm        = this.get('stateMachine');

    return new EmberPromise(function(resolve){
      sm.send('startOpen');
      resolve();
    }).then(function(){
      return torii.open(provider, options);
    }).then(function(authorization){
      var adapter = lookupAdapter(
        owner, provider
      );

      return adapter.open(authorization);
    }).then(function(user){
      sm.send('finishOpen', user);
      return user;
    }).catch(function(error){
      sm.send('failOpen', error);
      return reject(error);
    });
  },

  fetch(provider, options) {
    var owner     = getOwner(this),
        sm        = this.get('stateMachine');

    return new EmberPromise(function(resolve){
      sm.send('startFetch');
      resolve();
    }).then(function(){
      var adapter = lookupAdapter(
        owner, provider
      );

      return adapter.fetch(options);
    }).then(function(data){
      sm.send('finishFetch', data);
      return;
    }).catch(function(error){
      sm.send('failFetch', error);
      return reject(error);
    });
  },

  close(provider, options) {
    var owner     = getOwner(this),
        sm        = this.get('stateMachine');

    return new EmberPromise(function(resolve){
      sm.send('startClose');
      resolve();
    }).then(function(){
      var adapter = lookupAdapter(owner, provider);
      return adapter.close(options);
    }).then(function(){
      sm.send('finishClose');
    }).catch(function(error){
      sm.send('failClose', error);
      return reject(error);
    });
  }
});
