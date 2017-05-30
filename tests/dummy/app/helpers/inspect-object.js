import Ember from 'ember';

export function inspectObject([obj]/*, hash*/) {
  return Ember.String.htmlSafe(JSON.stringify(obj));
}

export default Ember.Helper.helper(inspectObject);
