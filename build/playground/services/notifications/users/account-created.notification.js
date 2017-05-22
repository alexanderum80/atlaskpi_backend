"use strict";
var Handlebars = require("handlebars");
var __1 = require("../..");
var AccountCreatedNotification = (function () {
    function AccountCreatedNotification(_config) {
        this._config = _config;
    }
    AccountCreatedNotification.prototype.notify = function (user, email, data) {
        var createAccountTemplate = Handlebars.compile(this._config.usersService.services.createUser.emailTemplate);
        var dataSource = user.toObject();
        var emailContent = createAccountTemplate(dataSource);
        return __1.sendEmail(email, this._config.usersService.app.name + ": Account Created", emailContent);
    };
    return AccountCreatedNotification;
}());
exports.AccountCreatedNotification = AccountCreatedNotification;
;
//# sourceMappingURL=account-created.notification.js.map