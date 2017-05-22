"use strict";
// import mongoose = require('mongoose');
var mongoose = require("mongoose");
var Promise = require("bluebird");
var winston = require("winston");
function connectToMongoDb(dbUri) {
    winston.debug("Conecting to server: " + dbUri);
    return new Promise(function (resolve, reject) {
        var conn = mongoose.createConnection(dbUri);
        conn.on('connected', function () {
            winston.debug('Mongoose custom connection open to ' + dbUri);
            resolve(conn);
        });
        conn.on('error', function (err) {
            winston.error('Mongoose custom connection error: ' + err);
            reject(err);
        });
        conn.on('disconnected', function () {
            winston.debug('Mongoose custom connection disconnected');
        });
        process.on('SIGINT', function () {
            conn.close(function () {
                winston.debug('Mongoose custom connection disconnected through app termination');
                process.exit(0);
            });
        });
    });
}
exports.__esModule = true;
exports["default"] = connectToMongoDb;
function documentNotExist(model, condition) {
    return new Promise(function (resolve, reject) {
        model.findOne(condition, function (err, res) {
            if (err) {
                reject(err);
            }
            else if (!res) {
                resolve(true);
            }
            reject(false);
        });
    });
}
exports.documentNotExist = documentNotExist;
//# sourceMappingURL=mongo-utils.js.map