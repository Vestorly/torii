export default function getRouterInstance(appInstance) {
  // backwards compat for Ember < 2.0
  return appInstance.get('router') || appInstance.lookup('router:main');
}
