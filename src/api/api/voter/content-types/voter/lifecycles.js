module.exports = {
    async beforeCreate(event) {
        const { data } = event.params;

        console.log('========================================');
        console.log('🔍 Lifecycle: Checking for existing vote before create...');
        console.log('📦 Raw data received:', JSON.stringify(data, null, 2));

        // ⭐ FIXED: Extract IDs from Strapi's { set: [ { id: X } ] } format
        const answerId = data.answer?.set?.[0]?.id || data.answer;
        const userProfileId = data.user_profile?.set?.[0]?.id || data.user_profile;

        console.log('🔑 Extracted IDs:', { answerId, userProfileId });

        if (!answerId || !userProfileId) {
            console.log('⚠️ Missing answer or user profile ID');
            console.log('========================================');
            return;
        }

        try {
            // Query using numeric IDs
            const existingVotes = await strapi.db.query('api::voter.voter').findMany({
                where: {
                    answer: answerId,
                    user_profile: userProfileId
                }
            });

            console.log('📊 Existing votes found:', existingVotes?.length || 0);

            if (existingVotes && existingVotes.length > 0) {
                console.log('❌ Duplicate vote detected!');
                console.log('Existing vote:', existingVotes[0]);
                console.log('========================================');
                // ⭐ FIXED: Proper error throwing
                const error = new Error('You have already voted on this answer');
                error.name = 'ValidationError';
                error.status = 400;
                throw error;
            }

            console.log('✅ No duplicate found, proceeding with vote creation');
            console.log('========================================');
        } catch (error) {
            console.log('❌ Error in lifecycle check:', error.message);
            console.log('========================================');
            throw error;
        }
    }
};