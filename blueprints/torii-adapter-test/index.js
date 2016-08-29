var testInfo = require('ember-cli-test-info');

module.exports = {
  description: 'Generates a torii adapter unit test.'
  
  availableOptions: [],
  
  locals: function(options) {
    return {
      friendlyTestDescription: testInfo.description(options.entity.name, "Unit", "ToriiAdapter")
    };
  }

  // afterInstall: function(options) {
  //   // Perform extra work here.
  // }
};
