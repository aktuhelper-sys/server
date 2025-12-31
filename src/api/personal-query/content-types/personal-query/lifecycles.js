module.exports = {
    async beforeCreate(event) {
        // Automatically set isNew to true for all new personal queries
        event.params.data.isNew = true;
        console.log('✅ Setting isNew: true for new personal query');
    },

    async afterCreate(event) {
        console.log('✅ Personal query created:', {
            id: event.result.documentId,
            title: event.result.title,
            isNew: event.result.isNew
        });
    }
};