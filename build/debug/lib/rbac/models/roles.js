"use strict";
var mongoose = require("mongoose");
var utils_1 = require("./utils");
// SCHEMA
exports.RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    displayName: String,
    description: String,
    permissions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission'
        }]
});
// METHODS
exports.RoleSchema.methods.can = function (action, subject, done) {
    this.model('Role').findById(this._id, function (err, role) {
        if (err)
            return done(err);
        utils_1.doCan.call(role, utils_1.CAN_ALL, [
            [action, subject]
        ], done);
    });
};
exports.RoleSchema.methods.canAll = function (actionsAndSubjects, done) {
    this.model('Role').findById(this._id, function (err, role) {
        if (err)
            return done(err);
        utils_1.doCan.call(role, utils_1.CAN_ALL, actionsAndSubjects, done);
    });
};
exports.RoleSchema.methods.canAny = function (actionsAndSubjects, done) {
    this.model('Role').findById(this._id, function (err, role) {
        if (err)
            return done(err);
        utils_1.doCan.call(role, utils_1.CAN_ANY, actionsAndSubjects, done);
    });
};
exports.RoleSchema.pre('save', function (done) {
    var that = this;
    this.model('Role').findOne({
        name: that.name
    }, function (err, role) {
        if (err) {
            done(err);
        }
        else if (role && !(role._id.equals(that._id))) {
            that.invalidate('name', 'name must be unique');
            done(new Error('Role name must be unique'));
        }
        else {
            done();
        }
    });
});
function getRoleModel(m) {
    return m.model('Role', exports.RoleSchema, 'roles');
}
exports.getRoleModel = getRoleModel;
//# sourceMappingURL=roles.js.map