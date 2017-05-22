"use strict";
var crypto = require("crypto");
function generateUniqueHash() {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    return crypto.createHash('sha1').update(current_date + random).digest('hex');
}
exports.generateUniqueHash = generateUniqueHash;
//# sourceMappingURL=generators.js.map