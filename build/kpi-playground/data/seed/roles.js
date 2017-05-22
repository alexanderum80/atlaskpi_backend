"use strict";
var models_1 = require("../models");
var rbac_1 = require("../../lib/rbac");
var winston = require("winston");
function seedRoles() {
    models_1.getContext('mongodb://localhost/customer2').then(function (ctx) {
        ctx.Role.find({}).then(function (roles) {
            if (roles.length > 0) {
                return;
            }
            winston.debug('Seeding roles for customer2');
            rbac_1.initRoles(ctx, {
                admin: [
                    ['create', 'Post'],
                    ['read', 'Post'],
                    ['update', 'Post'],
                    ['delete', 'Post']
                ],
                semiAdmin: [
                    // we can also specify permissions as an object
                    { action: 'read', subject: 'Post' }
                ],
                manager: [
                    ['create', 'Post'],
                ],
                supervisor: [
                    ['create', 'Post'],
                ],
                externalUser: [
                    ['create', 'Post'],
                ],
                viewer: [
                    ['create', 'Post'],
                ]
            }, function (err, admin, readonly) {
                console.log(admin);
                console.log(readonly);
            });
        });
    });
}
exports.__esModule = true;
exports["default"] = seedRoles;
;
//# sourceMappingURL=roles.js.map