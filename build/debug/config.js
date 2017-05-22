"use strict";
var configuration_1 = require("./configuration");
exports.config = {
    masterDb: 'mongodb://localhost/kpibi',
    token: {
        secret: 'jyeu4L?v*FGXmsGAYEXPjp(i',
        expiresIn: '10 d'
    },
    emailService: configuration_1.emailServiceConfig,
    usersService: configuration_1.usersServiceConfig
};
//# sourceMappingURL=config.js.map