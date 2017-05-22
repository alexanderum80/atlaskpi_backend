"use strict";
var fs = require("fs");
function readTemplate(name) {
    return fs.readFileSync(__dirname + '/templates/' + name + '.template.hbs', 'utf8');
}
exports.usersServiceConfig = {
    app: {
        name: 'Application Name',
        url: 'http://localhost:9090'
    },
    from: 'orlando@kpibi.com',
    usernameField: 'email',
    locking: {
        tries: 3,
        period: 5
    },
    services: {
        createUser: {
            emailTemplate: readTemplate('account-created'),
            // https://github.com/zeit/ms
            expiresIn: '7 days'
        },
        verifyEmail: {
            emailTemplate: readTemplate('verify-email'),
            expiresIn: '7 days'
        },
        forgotPassword: {
            emailTemplate: readTemplate('forgot-password'),
            expiresIn: '1d'
        },
        enrollment: {
            emailTemplate: readTemplate('new-enrollment'),
            expiresIn: '7 days'
        }
    }
};
//# sourceMappingURL=index.js.map