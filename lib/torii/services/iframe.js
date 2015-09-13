import UiServiceMixin from 'torii/mixins/ui-service-mixin';

var on = Ember.on;

var Iframe = Ember.Object.extend(Ember.Evented, UiServiceMixin, {

  // Open an iframe window.
  openRemote: function(url, pendingRequestKey, options){
    this.remote = Ember.$('<iframe src="'+url+'" id="torii-iframe"></iframe>'); //window.open(url, pendingRequestKey, optionsString);
    var iframeParent = 'body';
    if(options && options.iframeParent){
      iframeParent = options.iframeParent;
    }
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
