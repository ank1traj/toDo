var db            = require('../../config/database');  // database connection needed for auto increment plugin
var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');  // mongoose auto increment plugin

// initializing auto increment plugin
var connection = mongoose.createConnection(db.database);
autoIncrement.initialize(connection);

// set up a mongoose model
var ListSchema = new Schema({
    listId: {
        type: Number,
        required: true,
        unique: true
    },
    holder: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

// setting a field for auto increment
ListSchema.plugin(autoIncrement.plugin, {
    model: 'List',
    field: 'listId',
    startAt: 1
});
var List = connection.model('List', ListSchema);

module.exports = mongoose.model('List', ListSchema);