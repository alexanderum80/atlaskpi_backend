"use strict";
var Handlebars = require("handlebars");
var __1 = require("../..");
var EnrollmentNotification = (function () {
    function EnrollmentNotification(_config) {
        this._config = _config;
    }
    EnrollmentNotification.prototype.notify = function (user, email, data) {
        var forgotPasswordTemplate = Handlebars.compile(this._config.usersService.services.enrollment.emailTemplate);
        var dataSource = user.toObject();
        var emailContent = forgotPasswordTemplate(dataSource);
        return __1.sendEmail(email, this._config.usersService.app.name + ": Forgot Password", emailContent);
    };
    return EnrollmentNotification;
}());
exports.EnrollmentNotification = EnrollmentNotification;
//# sourceMappingURL=enrollment.notification.js.map