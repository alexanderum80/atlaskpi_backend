"use strict";
var AccountNameAvailableQuery = (function () {
    function AccountNameAvailableQuery(identity, _AccountModel) {
        this.identity = identity;
        this._AccountModel = _AccountModel;
    }
    // log = true;
    // audit = true;
    AccountNameAvailableQuery.prototype.run = function (data) {
        return this._AccountModel.accountNameAvailable(data.name);
    };
    return AccountNameAvailableQuery;
}());
exports.AccountNameAvailableQuery = AccountNameAvailableQuery;
//# sourceMappingURL=account-name-available.query.js.map