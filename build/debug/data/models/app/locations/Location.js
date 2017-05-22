"use strict";
var mongoose = require("mongoose");
var common_1 = require("../../common");
var Schema = mongoose.Schema;
var LocationSchema = new Schema({
    name: String,
    address: common_1.Address
});
// LocationSchema.methods.
// LocationSchema.statics.
function getLocationModel(m) {
    return m.model('Location', LocationSchema, 'locations');
}
exports.getLocationModel = getLocationModel;
//# sourceMappingURL=Location.js.map