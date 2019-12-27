import PopupService from 'torii/services/popup';
import ParseQueryString from 'torii/lib/parse-query-string';
import { resolve } from 'rsvp';

export default class MyFirstPopup extends PopupService {
  constructor(options = {}) {
    super(...arguments);

    this.opened = false;
    this.state = options.state
  }

  open(url, keys) {
    this.opened = true;

    const parser = ParseQueryString.create({url: url, keys: ['state']});
    const data = parser.parse();
    let state = data.state;

    if (this.state !== undefined) {
      state = this.state;
    }

    const response = { code: 'test' };

    if (keys.indexOf('state') !== -1) {
      response.state = state;
    }

    return resolve(response);
  }
}
