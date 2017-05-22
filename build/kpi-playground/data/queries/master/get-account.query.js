"use strict";
var Promise = require("bluebird");
var GetAccountQuery = (function () {
    function GetAccountQuery(identity, _AccountModel) {
        this.identity = identity;
        this._AccountModel = _AccountModel;
    }
    GetAccountQuery.prototype.run = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._AccountModel.findOne(data).then(function (account) {
                if (!account) {
                    reject({ name: 'not-found', message: 'Account not found' });
                }
                resolve(account);
            }, function (err) {
                reject(err);
            });
        });
    };
    return GetAccountQuery;
}());
exports.GetAccountQuery = GetAccountQuery;
//# sourceMappingURL=get-account.query.js.map