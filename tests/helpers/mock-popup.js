import { parseQueryString } from 'torii/lib/query-string';
import { resolve } from 'rsvp';

var MockPopup = function(options) {
  options = options || {};

  this.opened = false;
  this.state = options.state;
};

MockPopup.prototype.open = function(url, keys){
  this.opened = true;

  var data = parseQueryString(url, ['state']),
    state = data.state;

  if (this.state !== undefined) {
    state = this.state;
  }

  var response = { code: 'test' };

  if (keys.indexOf('state') !== -1) {
    response.state = state;
  }

  return resolve(response);
};

export default MockPopup;
