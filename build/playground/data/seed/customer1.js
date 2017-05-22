"use strict";
var users_1 = require("../../services/notifications/users");
var models_1 = require("../models");
var winston = require("winston");
var config_1 = require("../../config");
var newUsers = [{
        firstName: 'Mario',
        lastName: 'Quero',
        middleName: '',
        email: 'mario@email.com',
        username: 'marito',
        password: 'password'
    }, {
        firstName: 'Orlando',
        lastName: 'Quero',
        middleName: 'M',
        email: 'orlando@gmail.com',
        username: 'orlando'
    }, {
        firstName: 'Adileidy',
        lastName: 'Quero',
        middleName: 'M',
        email: 'orlaqp@yahoo.com',
        username: 'adi',
        password: '123456'
    }
];
function seedCustomer2() {
    models_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        ctx.User.find({}).then(function (users) {
            if (users.length > 0) {
                return;
            }
            var index = 0;
            var roles = ['admin', 'manager', 'supervisor'];
            winston.debug('Seeding users for customer2');
            newUsers.forEach(function (user) {
                var notifier = new users_1.AccountCreatedNotification(config_1.config);
                ctx.User.createUser(user, notifier).then(function (response) {
                    response.entity.addRole(roles[index]);
                    index++;
                }, function (err) {
                    winston.error('Error creating user mario: ', err);
                });
            });
        });
    });
}
exports.__esModule = true;
exports["default"] = seedCustomer2;
;
//# sourceMappingURL=customer1.js.map