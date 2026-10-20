const { withEntitlementsPlist } = require('expo/config-plugins');

// This MVP schedules local notifications only. Do not require an APNs profile.
module.exports = function withLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
