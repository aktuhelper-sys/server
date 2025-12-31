'use strict';

/**
 * query-view service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::query-view.query-view');
