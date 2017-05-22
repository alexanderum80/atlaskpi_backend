"use strict";
var UserForgotPasswordMutation = (function () {
    function UserForgotPasswordMutation(identity, _forgotPasswordNotifier, _UserModel) {
        this.identity = identity;
        this._forgotPasswordNotifier = _forgotPasswordNotifier;
        this._UserModel = _UserModel;
        this.audit = true;
    }
    UserForgotPasswordMutation.prototype.run = function (data) {
        return this._UserModel.forgotPassword(data.email, this._forgotPasswordNotifier).then(function (sentInfo) {
            return { success: true };
        }, function (err) {
            return { success: false };
        });
    };
    return UserForgotPasswordMutation;
}());
exports.UserForgotPasswordMutation = UserForgotPasswordMutation;
//# sourceMappingURL=user-forgot-password.mutation.js.map