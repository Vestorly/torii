module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
    'ember/no-global-jquery': 0, // this rule is broken
    'ember/avoid-leaking-state-in-ember-objects': 0
  },
  globals: {
  }
};
