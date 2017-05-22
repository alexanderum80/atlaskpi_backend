"use strict";
var Promise = require("bluebird");
function initRoles(ctx, rolesAndPermissions, done) {
    var count = Object.keys(rolesAndPermissions).length, roles = [];
    return new Promise(function (resolve, reject) {
        for (var name_1 in rolesAndPermissions) {
            var len = void 0, role = void 0;
            // Convert [action, subject] arrays to objects
            len = rolesAndPermissions[name_1].length;
            for (var i = 0; i < len; i++) {
                if (Array.isArray(rolesAndPermissions[name_1][i])) {
                    rolesAndPermissions[name_1][i] = {
                        action: rolesAndPermissions[name_1][i][0],
                        subject: rolesAndPermissions[name_1][i][1]
                    };
                }
            }
            // Create role
            role = new ctx.Role({ name: name_1 });
            roles.push(role);
            role.save(function (err, role) {
                if (err)
                    return reject(err);
                // Create role's permissions if they do not exist
                ctx.Permission.findOrCreate(rolesAndPermissions[role.name], function (err) {
                    if (err)
                        return reject(err);
                    // Add permissions to role
                    role.permissions = Array.prototype.slice.call(arguments, 1);
                    // Save role
                    role.save(function (err) {
                        if (err)
                            return reject(err);
                        --count || done.apply(null, [err].concat(roles));
                    });
                });
            });
        }
    });
}
exports.initRoles = initRoles;
;
//# sourceMappingURL=init-roles.js.map