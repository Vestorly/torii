import Application from '../../app';
import config from '../../config/environment';
import { merge, assign as emberAssign } from '@ember/polyfills';
import { run } from '@ember/runloop';

const assign = Object.assign || emberAssign || merge;

export default function startApp(attrs) {
  let attributes = assign({}, config.APP);
  attributes.autoboot = true;
  attributes = assign(attributes, attrs); // use defaults, but you can override;

  return run(() => {
    let application = Application.create(attributes);
    application.setupForTesting();
    application.injectTestHelpers();
    return application;
  });
}
