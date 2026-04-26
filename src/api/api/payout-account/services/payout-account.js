'use strict';

/**
 * payout-account service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::payout-account.payout-account');
