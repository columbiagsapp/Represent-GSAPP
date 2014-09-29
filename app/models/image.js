'use strict';

console.log('models/image'.magenta);

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Image Schema
 */
var ImageSchema = new Schema({
    status: {
        type: String,
        defaut: 'pending'
    },
    created_time: String,
    content: Schema.Types.Mixed,
    programs: [String],
    location: String,
    date: String,
    downloaded: {
        type: Boolean,
        defaut: false
    }
});




mongoose.model('Image', ImageSchema);
