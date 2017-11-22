import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['torii-iframe-placeholder'],
  didInsertElement: function(){
    this.sendAction('didInsertToriiIframePlaceholder');
  }
});
