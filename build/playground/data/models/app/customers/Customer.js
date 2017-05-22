"use strict";
var common_1 = require("../../common");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var CustomerSchema = new Schema({
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    gender: { type: Boolean },
    dob: Date,
    address: common_1.Address
});
// CustomerSchema.methods.
// CustomerSchema.statics.
function getCustomerModel(m) {
    return m.model('Customer', CustomerSchema, 'customers');
}
exports.getCustomerModel = getCustomerModel;
//# sourceMappingURL=Customer.js.map