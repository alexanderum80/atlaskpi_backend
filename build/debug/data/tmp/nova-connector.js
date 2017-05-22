"use strict";
// import { Mongoose } from 'mongoose';
var mongoose = require("mongoose");
var Promise = require("bluebird");
var config_1 = require("../config");
var winston = require("winston");
function makeDefaultConnection() {
    return new Promise(function (resolve, reject) {
        var dbUri = config_1.config.masterDb; // 'mongodb://localhost/nova';
        // if the connection is open, leave this block
        if (mongoose.connection.readyState === 1) {
            resolve(true);
            return;
        }
        mongoose.connect(dbUri);
        mongoose.connection.on('connected', function () {
            winston.debug('debug', 'Mongoose default connection open to ' + dbUri);
            resolve(true);
        });
        mongoose.connection.on('error', function (err) {
            winston.error('Mongoose default connection error', { error: err });
            reject(false);
        });
        mongoose.connection.on('disconnected', function () {
            winston.debug('debug', 'Mongoose default connection disconnected');
        });
        process.on('SIGINT', function () {
            mongoose.connection.close(function () {
                winston.debug('debug', 'Mongoose default connection disconnected through app termination');
                process.exit(0);
            });
        });
    });
}
exports.__esModule = true;
exports["default"] = makeDefaultConnection;
//# sourceMappingURL=nova-connector.js.map