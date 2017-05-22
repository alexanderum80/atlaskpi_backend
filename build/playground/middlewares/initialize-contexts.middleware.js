"use strict";
var models_1 = require("../data/models");
var logger = require("winston");
function initializeContexts(req, res, next) {
    models_1.getMasterContext().then(function (ctx) {
        req.masterContext = ctx;
        // try to create the app context based on the identity or the hostname
        var hostname = _getHostname(req);
        // using identity
        if (req.identity) {
            logger.debug('creating app context from user identity');
            var identity = req.identity;
            models_1.getContext(identity.dbUri).then(function (ctx) {
                req.appContext = ctx;
                next();
            });
        }
        else if (hostname) {
            logger.debug('creating app context from user hostname');
            ctx.Account.findAccountByHostname(hostname).then(function (account) {
                models_1.getContext(account.getConnectionString()).then(function (ctx) {
                    req.appContext = ctx;
                    next();
                });
            });
        }
        else {
            logger.debug('no app context will be created for this request');
            next();
        }
    });
}
exports.initializeContexts = initializeContexts;
function _getHostname(req) {
    //  just for testing
    return 'customer2.kpibi.com';
    // // check host value from body
    // let hostname: String = req.body.host || req.hostname || req.subdomain;
    // // stop if not host have been passed
    // if (!hostname)
    //     return null;
    // let hostTokens = hostname.split('.');
    // // make sure that we have at least 4 tokens, otherwise there is not a subdomain
    // return hostTokens.length !== 3 ? null : hostname;
}
//# sourceMappingURL=initialize-contexts.middleware.js.map