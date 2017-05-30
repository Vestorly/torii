import UiServiceMixin from 'torii/mixins/ui-service-mixin';

var Iframe = Ember.Object.extend(Ember.Evented, UiServiceMixin, {

  openRemote: function(url){
    this.remote = Ember.$('<iframe src="'+url+'" id="torii-iframe"></iframe>');
    var iframeParent = '.torii-iframe-placeholder';
    Ember.$(iframeParent).append(this.remote);
  },

  closeRemote: function(){
    this.remote.remove();
  },

  pollRemote: function(){
    if (Ember.$('#torii-iframe').length === 0) {
      this.trigger('didClose');
    }
  }

});

export default Iframe;
