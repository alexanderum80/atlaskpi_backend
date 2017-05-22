"use strict";
var Promise = require("bluebird");
var jwt = require("jsonwebtoken");
var winston = require("winston");
var config_1 = require("../config");
var ms = require("ms");
var moment = require("moment");
var AuthController = (function () {
    function AuthController(_Account, _appContext) {
        this._Account = _Account;
        this._appContext = _appContext;
        this.status = 'intial value';
    }
    AuthController.prototype.authenticateUser = function (hostname, username, password) {
        var _this = this;
        var that = this;
        return new Promise(function (resolve, reject) {
            if (!hostname) {
                throw { status: 400, message: 'Invalid hostname' };
            }
            if (!username || !password) {
                throw { status: 400, message: 'Username or password missing' };
            }
            var account;
            var user;
            _this._Account.findAccountByHostname(hostname)
                .then(function (acct) {
                winston.debug('token: account found');
                account = acct;
                return that._appContext.User.authenticate(username, password);
            })
                .then(function (user) {
                winston.debug('token: credentials validated');
                return that._generateIdentity(account, user);
            })
                .then(function (identity) {
                winston.debug('token: identity generated');
                return that._generateToken(identity);
            })
                .then(function (token) {
                winston.debug('token: token generated: ' + token);
                resolve({
                    '.issued': new Date(),
                    '.expires': moment().add('milliseconds', ms(config_1.config.token.expiresIn)).toDate(),
                    'access_token': token
                });
            })["catch"](function (err) {
                winston.error('Error generating user token: ', err);
                if (err && err.name === 'notfound') {
                    err.status = 404;
                }
                reject(err);
            });
        });
    };
    AuthController.prototype._generateIdentity = function (account, user) {
        return new Promise(function (resolve, reject) {
            var userSignature = {
                firstName: user.profile.firstName,
                middleName: user.profile.middleName,
                lastName: user.profile.lastName,
                roles: user.roles.map(function (role) { return role.name; }),
                dbUri: account.getConnectionString()
            };
            resolve(userSignature);
        });
    };
    AuthController.prototype._generateToken = function (identity) {
        return new Promise(function (resolve, reject) {
            var token = jwt.sign(identity, config_1.config.token.secret, {
                expiresIn: config_1.config.token.expiresIn
            });
            resolve(token);
        });
    };
    return AuthController;
}());
exports.AuthController = AuthController;
//# sourceMappingURL=auth-controller.js.map