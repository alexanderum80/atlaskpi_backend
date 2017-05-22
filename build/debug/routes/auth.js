"use strict";
var url = require("url");
var express = require("express");
var controllers_1 = require("../controllers");
var auth = express.Router();
exports.auth = auth;
auth.post('/token', function authenticate(req, res) {
    var hostname = _getHostname(req);
    var authManager = new controllers_1.AuthController(req.masterContext.Account, req.appContext);
    authManager.authenticateUser(hostname, req.body.username, req.body.password)
        .then(function (tokenInfo) {
        res.status(200).json(tokenInfo);
    }, function (err) {
        res.status(err.status || 401).json({ error: err.message });
    });
});
function _getHostname(req) {
    // check host value from body
    var companySubdomain = req.body.host || req.hostname;
    // stop if not host have been passed
    if (!companySubdomain)
        return null;
    var hostUri = url.parse(companySubdomain);
    var hostTokens = hostUri.hostname.split('.');
    // make sure that we have at least 4 tokens, otherwise there is not a subdomain
    return hostTokens.length !== 3 ? null : hostUri.hostname;
}
//# sourceMappingURL=auth.js.map