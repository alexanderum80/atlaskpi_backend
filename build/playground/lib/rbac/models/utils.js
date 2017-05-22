"use strict";
exports.CAN_ALL = 'all';
exports.CAN_ANY = 'any';
function doCan(type, actionsAndSubjects, done) {
    var role = this;
    role.populate('permissions', function (err, role) {
        if (err)
            return done(err);
        var count = 0, hasAll = false;
        if (role.permissions) {
            actionsAndSubjects.forEach(function (as) {
                var has = false;
                role.permissions.forEach(function (p) {
                    if (p.action === as[0] && p.subject === as[1])
                        has = true;
                });
                if (has)
                    count++;
            });
        }
        if (type === exports.CAN_ANY) {
            hasAll = (count > 0);
        }
        else {
            hasAll = (count === actionsAndSubjects.length);
        }
        done(null, hasAll);
    });
}
exports.doCan = doCan;
function resolveRole(context, role, done) {
    if (typeof role === 'string') {
        context.model('Role').findOne({ name: role }, function (err, role) {
            console.log('role found: ' + role);
            if (err)
                return done(err);
            if (!role)
                return done(new Error('Unknown role: ' + role));
            done(null, role);
        });
    }
    else {
        done(null, role);
    }
}
exports.resolveRole = resolveRole;
//# sourceMappingURL=utils.js.map