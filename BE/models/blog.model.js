const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 500
    },
    content: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    },
    source: {
        type: String,
        required: false
    },
    sourceUrl: {
        type: String,
        required: false
    },
    category: {
        type: String,
        enum: [
            'technology', 'health', 'education', 'science', 'general',
            'blood test', 'complete blood count', 'blood analysis',
            'laboratory', 'clinical laboratory', 'medical lab',
            'blood disorders', 'anemia', 'leukemia', 'hemophilia',
            'healthy blood tips', 'improve blood health', 'blood circulation tips'
        ],
        default: 'general'
    },
    publishedAt: {
        type: Date,
        required: false
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    externalId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    }
}, {
    timestamps: true,
    versionKey: false // Disable the __v field
});

// Index for better performance
BlogSchema.index({ publishedAt: -1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ isVisible: 1 });

module.exports = mongoose.model('Blog', BlogSchema);