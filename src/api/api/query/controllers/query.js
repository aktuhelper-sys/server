'use strict';

/**
 * query controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::query.query', ({ strapi }) => ({

    // ⭐ Custom method to increment view count with user tracking
    async incrementView(ctx) {
        const { id } = ctx.params; // Query documentId
        const { userId } = ctx.request.body; // User documentId from frontend

        try {
            console.log('👁️ View increment request:', { queryId: id, userId });

            if (!id) {
                return ctx.badRequest('Query ID is required');
            }

            // Find the query with user_profile populated
            const query = await strapi.documents('api::query.query').findOne({
                documentId: id,
                populate: ['user_profile']
            });

            if (!query) {
                return ctx.notFound('Query not found');
            }

            // ⭐ SKIP if user is the query author (don't count own views)
            if (userId && query.user_profile?.documentId === userId) {
                console.log('⏭️ User is author, skipping view increment');
                return ctx.send({
                    data: {
                        viewCount: query.viewCount || 0,
                        alreadyViewed: true,
                        reason: 'author'
                    }
                });
            }

            // ⭐ Check if user already viewed this query
            if (userId) {
                const existingView = await strapi.documents('api::query-view.query-view').findMany({
                    filters: {
                        query: { documentId: id },
                        user_profile: { documentId: userId }
                    },
                    limit: 1
                });

                if (existingView && existingView.length > 0) {
                    console.log('⏭️ User already viewed this query');
                    return ctx.send({
                        data: {
                            viewCount: query.viewCount || 0,
                            alreadyViewed: true,
                            reason: 'already_viewed'
                        }
                    });
                }
            }

            // ⭐ Create new view record
            if (userId) {
                await strapi.documents('api::query-view.query-view').create({
                    data: {
                        query: id,
                        user_profile: userId,
                        viewedAt: new Date()
                    }
                });
                console.log('✅ View record created');
            }

            // ⭐ Increment view count
            const newViewCount = (query.viewCount || 0) + 1;

            const updatedQuery = await strapi.documents('api::query.query').update({
                documentId: id,
                data: {
                    viewCount: newViewCount
                }
            });

            console.log('✅ View count incremented to:', newViewCount);

            return ctx.send({
                data: {
                    viewCount: updatedQuery.viewCount,
                    alreadyViewed: false
                }
            });

        } catch (error) {
            console.error('❌ Error incrementing view:', error);
            return ctx.internalServerError('Failed to increment view count');
        }
    }

}));