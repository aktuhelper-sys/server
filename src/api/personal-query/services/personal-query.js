'use strict';

/**
 * personal-query service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::personal-query.personal-query');
