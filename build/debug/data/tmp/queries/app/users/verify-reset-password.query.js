"use strict";
var VerifyResetPasswordQuery = (function () {
    function VerifyResetPasswordQuery(identity, _UserModel) {
        this.identity = identity;
        this._UserModel = _UserModel;
    }
    // log = true;
    // audit = true;
    VerifyResetPasswordQuery.prototype.run = function (data) {
        return this._UserModel.verifyResetPasswordToken(data.token);
    };
    return VerifyResetPasswordQuery;
}());
exports.VerifyResetPasswordQuery = VerifyResetPasswordQuery;
//# sourceMappingURL=verify-reset-password.query.js.map