import ParseQueryString from 'torii/lib/parse-query-string';

var MockPopup = function(options) {
  options = options || {};

  this.opened = false;
  this.state = options.state;
  this.response = options.response || { code: 'test' }
};

MockPopup.prototype.open = function(url, keys){
  this.opened = true;
  this.url = url;

  var parser = ParseQueryString.create({url: url, keys: ['state']}),
    data = parser.parse(),
    state = data.state;

  if (this.state !== undefined) {
    state = this.state;
  }

  var response = this.response;

  if (keys.indexOf('state') !== -1) {
    response.state = state;
  }

  return Ember.RSVP.resolve(response);
};

export default MockPopup;
