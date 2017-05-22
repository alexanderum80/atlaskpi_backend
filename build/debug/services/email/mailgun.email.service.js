"use strict";
var config_1 = require("../../config");
var nodemailer = require("nodemailer");
var mg = require("nodemailer-mailgun-transport");
var Promise = require("bluebird");
exports.MailgunService = {
    sendEmail: function (from, to, subject, html) {
        return new Promise(function (resolve, reject) {
            var auth = config_1.config.emailService.mailgun;
            var nodemailerMailgun = nodemailer.createTransport(mg(auth));
            nodemailerMailgun.sendMail({
                from: from,
                to: to,
                subject: subject,
                html: html
            }, function (err, info) {
                if (err) {
                    reject(err);
                }
                resolve(info);
            });
        });
    }
};
//# sourceMappingURL=mailgun.email.service.js.map