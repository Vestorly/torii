import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function inspectObject([obj]/*, hash*/) {
  return htmlSafe(JSON.stringify(obj));
}

export default helper(inspectObject);
