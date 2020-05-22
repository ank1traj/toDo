'use strict';

var mongoClient = require('mongodb').MongoClient;

module.exports = {
    'secret': 'GreedIsGood',
    'database': 'mongodb://localhost:27017/todo',



    'fetch': function (collectionName, searchParam, callback) {

        mongoClient.connect(this.database, function (err, db) {
            if (err) throw err;

            var collection = db.collection(collectionName);

            collection.find(searchParam)
                      .sort( {id : 1} )
                      .toArray(function (err, documents) {
                if (err) throw err;

                callback(documents);
                db.close();
            });
        });
    },
    'update': function (collectionName, searchParam, newInfo, callback) {

        mongoClient.connect(this.database, function (err, db) {
            if (err) throw err;

            var objForUpdate = {};
            if (newInfo.name) objForUpdate.name = newInfo.name;
            if (newInfo.priority) objForUpdate.priority = newInfo.priority;
            if (newInfo.checked == true || newInfo.checked == false) objForUpdate.checked = newInfo.checked;

            var collection = db.collection(collectionName);

            collection.update(searchParam,
                              {$set: objForUpdate},
                              function (err, document) {
                if (err) throw err;

                callback(document);
                db.close();
            });
        });
    },
    'remove': function (collectionName, searchParam, callback) {

        mongoClient.connect(this.database, function (err, db) {
            if (err) throw err;

            var collection = db.collection(collectionName);

            collection.findOneAndDelete(searchParam, function (err, collection) {
                if (err) throw err;

                callback(collection);
                db.close();
            });
        });
    },
    'removeMany': function (collectionName, searchParam, callback) {

        mongoClient.connect(this.database, function (err, db) {
            if (err) throw err;

            var collection = db.collection(collectionName);

            collection.deleteMany(searchParam, function (err, collection) {
                if (err) throw err;

                callback(collection);
                db.close();
            });
        });
    }
};