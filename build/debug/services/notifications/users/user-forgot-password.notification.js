"use strict";
var Handlebars = require("handlebars");
var __1 = require("../..");
var UserForgotPasswordNotification = (function () {
    function UserForgotPasswordNotification(_config) {
        this._config = _config;
    }
    UserForgotPasswordNotification.prototype.notify = function (user, email, data) {
        var forgotPasswordTemplate = Handlebars.compile(this._config.usersService.services.forgotPassword.emailTemplate);
        var dataSource = user.toObject();
        var emailContent = forgotPasswordTemplate(dataSource);
        return __1.sendEmail(email, this._config.usersService.app.name + ": Forgot Password", emailContent);
    };
    return UserForgotPasswordNotification;
}());
exports.UserForgotPasswordNotification = UserForgotPasswordNotification;
//# sourceMappingURL=user-forgot-password.notification.js.map