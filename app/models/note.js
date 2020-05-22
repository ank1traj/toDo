var db            = require('../../config/database');  // database connection needed for auto increment plugin
var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');  // mongoose auto increment plugin

// initializing auto increment plugin
var connection = mongoose.createConnection(db.database);
autoIncrement.initialize(connection);

// set up a mongoose model
var NoteSchema = new Schema({
    noteId: {
        type: Number,
        required: true,
        unique: true
    },
    listId: {
        type: Number,
        required: true
    },
    holder: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    checked: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        required: true
    }
});

// setting a field for auto increment
NoteSchema.plugin(autoIncrement.plugin, {
    model: 'Note',
    field: 'noteId',
    startAt: 1
});
var Note = connection.model('Note', NoteSchema);

module.exports = mongoose.model('Note', NoteSchema);