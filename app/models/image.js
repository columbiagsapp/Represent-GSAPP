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
    visible: {
        type: Boolean,
        defaut: true
    },
    content: Schema.Types.Mixed,
    programs: [String],
    downloaded: {
        type: Boolean,
        defaut: false
    }
});




mongoose.model('Image', ImageSchema);
