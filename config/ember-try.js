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
      name: 'Ember 1.13.15',
      dependencies: {
        'ember': '1.13.15'
      }
    },
    {
      name: 'Ember 2.4.6',
      dependencies: {
        'ember': '2.4.6'
      }
    },
    {
      name: 'Ember 2.8.1',
      dependencies: {
        'ember': '2.8.1'
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
      },
    },
    {
      name: 'Ember Release',
      dependencies: {
        'ember': 'components/ember#release'
      },
      resolutions: {
        'ember': 'release'
      }
    }
  ]
};
