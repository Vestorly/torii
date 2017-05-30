export default function getRouterLib(router) {
  /**
   * `router.router` deprecated in 2.13 until 2.16
   * see https://emberjs.com/deprecations/v2.x/#toc_ember-router-router-renamed-to-ember-router-_routermicrolib
   */
  return router._routerMicrolib || router.router;
}

