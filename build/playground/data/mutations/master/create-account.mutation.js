"use strict";
var CreateAccountMutation = (function () {
    function CreateAccountMutation(identity, _AccountModel) {
        this.identity = identity;
        this._AccountModel = _AccountModel;
        this.audit = true;
    }
    CreateAccountMutation.prototype.run = function (data) {
        return this._AccountModel.createNewAccount(data);
    };
    return CreateAccountMutation;
}());
exports.CreateAccountMutation = CreateAccountMutation;
//# sourceMappingURL=create-account.mutation.js.map