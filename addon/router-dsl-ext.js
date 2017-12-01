import Ember from 'ember';
import Router from '@ember/routing/router';
import getRouterLib from 'torii/compat/get-router-lib';

var proto = Ember.RouterDSL.prototype;

var currentMap = null;

proto.authenticatedRoute = function() {
  this.route.apply(this, arguments);
  currentMap.push(arguments[0]);
};

Router.reopen({
  _initRouterJs() {
    currentMap = [];
    this._super.apply(this, arguments);
    let routerLib = getRouterLib(this);
    routerLib.authenticatedRoutes = currentMap;
  }
});
