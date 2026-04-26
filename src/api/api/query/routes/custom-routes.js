'use strict';

/**
 * Custom routes for query
 */

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/queries/:id/increment-view',
            handler: 'query.incrementView',
            config: {
                auth: false, // ⭐ Allow unauthenticated users
                policies: [],
                middlewares: [],
            },
        },
    ],
};