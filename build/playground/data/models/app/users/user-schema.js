"use strict";
var mongoose = require("mongoose");
var rbac_1 = require("../../../../lib/rbac");
var user_plugin_1 = require("./user-plugin");
var Schema = mongoose.Schema;
var UserSchema = new Schema({});
UserSchema.plugin(user_plugin_1.accountPlugin);
UserSchema.plugin(rbac_1.rbacPlugin);
function getUserModel(m) {
    return m.model('User', UserSchema, 'users');
}
exports.getUserModel = getUserModel;
//# sourceMappingURL=user-schema.js.map