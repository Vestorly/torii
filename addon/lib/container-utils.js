import { getOwner as EmberGetOwner } from '@ember/application';

export function hasRegistration(application, name) {
  if (application && application.hasRegistration) {
    return application.hasRegistration(name);
  } else {
    return application.registry.has(name);
  }
}

export function register(applicationInstance, name, factory) {
  if (applicationInstance && applicationInstance.application) {
    return applicationInstance.application.register(name, factory);
  } else {
    return applicationInstance.registry.register(name, factory);
  }
}

export function lookupFactory(applicationInstance, name) {
  if (applicationInstance && applicationInstance.lookupFactory) {
    return applicationInstance.lookupFactory(name);
  } else if (applicationInstance && applicationInstance.resolveRegistration) {
    // See https://github.com/Vestorly/torii/issues/362
    return applicationInstance.resolveRegistration(name);
  } else if (applicationInstance && applicationInstance.application) {
    return applicationInstance.application.__container__.lookupFactory(name);
  } else {
    return applicationInstance.container.lookupFactory(name);
  }
}

export function lookup(applicationInstance, name) {
  if (applicationInstance && applicationInstance.lookup) {
    return applicationInstance.lookup(name);
  } else if (applicationInstance && applicationInstance.application) {
    return applicationInstance.application.__container__.lookup(name);
  } else {
    return applicationInstance.container.lookup(name);
  }
}

export function getOwner(instance) {
  if (EmberGetOwner) {
    return EmberGetOwner(instance);
  } else {
    return instance.container;
  }
}
