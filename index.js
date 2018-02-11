/* eslint-env node */
'use strict';

module.exports = {
  name: 'torii',
  included: function(app) {
    var hostApp = this._findApp(app);
    var toriiConfig = hostApp.project.config(app.env)['torii'];
    if (!toriiConfig && hostApp === app) {
      console.warn('Torii is installed but not configured in config/environment.js!'); // eslint-disable-line
    }

    this._super.included(app);
  },

  _findApp: function(hostApp) {
    var app = this.app || hostApp;
    while (app.app) {
      app = app.app;
    }
    return app;
  }
};
