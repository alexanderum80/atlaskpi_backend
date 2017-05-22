"use strict";
var winston = require("winston");
function logger(req, res, next) {
    var logger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({
                name: 'logs-file',
                filename: 'app-logs.log',
                level: 'info'
            }),
            new (winston.transports.File)({
                name: 'errors-file',
                filename: 'app-errors.log',
                level: 'error'
            })
        ]
    });
    req.logger = logger;
    winston.debug('Winston logger added to the middlewares');
    next();
}
exports.logger = logger;
//# sourceMappingURL=logger.middleware.js.map