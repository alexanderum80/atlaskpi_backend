"use strict";
var Promise = require("bluebird");
var GetIndustriesQuery = (function () {
    function GetIndustriesQuery(identity, _IndustryModel) {
        this.identity = identity;
        this._IndustryModel = _IndustryModel;
    }
    // log = true;
    // audit = true;
    GetIndustriesQuery.prototype.run = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._IndustryModel.find().then(function (industries) {
                if (!industries) {
                    reject({ name: 'not-found', message: 'Account not found' });
                }
                resolve(industries);
            }, function (err) {
                reject(err);
            });
        });
    };
    return GetIndustriesQuery;
}());
exports.GetIndustriesQuery = GetIndustriesQuery;
//# sourceMappingURL=get-industries.query.js.map