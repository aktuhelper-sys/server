'use strict';

/**
 * voter service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::voter.voter');
