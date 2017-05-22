"use strict";
var ResetPasswordMutation = (function () {
    function ResetPasswordMutation(identity, _UserModel) {
        this.identity = identity;
        this._UserModel = _UserModel;
    }
    // log = true;
    // audit = true;
    ResetPasswordMutation.prototype.run = function (data) {
        return this._UserModel.resetPassword(data.token, data.password);
    };
    return ResetPasswordMutation;
}());
exports.ResetPasswordMutation = ResetPasswordMutation;
//# sourceMappingURL=reset-password.mutation.js.map