"use strict";
var config_1 = require("../../config");
// import providers
var mailgun_email_service_1 = require("./mailgun.email.service");
function sendEmail(to, subject, html) {
    // send email function
    var sendFunction;
    // send email with right provider
    switch (config_1.config.emailService.provider) {
        case 'mailgun':
            sendFunction = mailgun_email_service_1.MailgunService.sendEmail;
            break;
    }
    // send email
    return sendFunction(config_1.config.emailService.from, to, subject, html);
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=index.js.map