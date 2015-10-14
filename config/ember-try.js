/* jshint node:true */
module.exports = {
  scenarios: [
    {
      name: 'Ember 1.12.1',
      dependencies: {
        'ember': '1.12.1'
      }
    },
    {
      name: 'Ember 1.13.7',
      dependencies: {
        'ember': '1.13.7'
      }
    },
    {
      name: 'Ember 2.0.2',
      dependencies: {
        'ember': '2.0.2'
      }
    },
    {
      name: 'Ember 2.1.0',
      dependencies: {
        'ember': '2.1.0'
      }
    },
    {
      name: 'Ember Canary',
      dependencies: {
        'ember': 'components/ember#canary'
      },
      resolutions: {
        'ember': 'canary'
      }
    },
    {
      name: 'Ember Beta',
      dependencies: {
        'ember': 'components/ember#beta'
      },
      resolutions: {
        'ember': 'beta'
      }
    }
  ]
};
