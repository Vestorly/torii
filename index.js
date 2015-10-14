/* jshint node: true */
'use strict';

module.exports = {
  name: 'torii',
  included: function(app) {
    var toriiConfig = this.app.project.config(app.env)['torii'];
    if (!toriiConfig) {
      console.warn('Torii is installed but not configured in config/environment.js!');
    }
    this._super.included(app);
  }
};
