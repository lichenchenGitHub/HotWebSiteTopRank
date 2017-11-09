var conf = require('../conf/config');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var connectionString = 'mongodb://' + conf.mongodb.user + ':' + conf.mongodb.passwd + '@' + conf.mongodb.host + ':' + conf.mongodb.port + '/' + conf.mongodb.db;

if (conf.mongodb.authdb) {
    connectionString = connectionString + '?authSource=' + conf.mongodb.authdb;
}

if (conf.mongoose.debug) {
    mongoose.set('debug', true);
}
mongoose.connect(connectionString, function (err) {
    if (err) {
        console.error('' + new Date() + ', failed to connect to: ' + connectionString + ', err: ' + err);
    }
});

mongoose.connection.on('open', function (ref) {
});

mongoose.connection.on('error', function (err) {
    console.error('' + new Date() + ', connection error: ' + err);
});

module.exports = mongoose;
