"use strict";
var jwt = require("jsonwebtoken");
var config_1 = require("../config");
var winston = require("winston");
function tokenValidator(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, config_1.config.token.secret, function (err, identity) {
            if (err) {
                winston.error('Invalid token', { token: token });
                return res.status(401).json({ error: 'Invalid token' }).end();
            }
            else {
                req.identity = identity;
                winston.debug('Signin request (adding identity)', { identity: req.identity });
                next();
            }
        });
    }
    else {
        next();
    }
}
exports.tokenValidator = tokenValidator;
//# sourceMappingURL=token-validator.middleware.js.map