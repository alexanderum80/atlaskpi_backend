"use strict";
var common_1 = require("../../common");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var EmployeeSchema = new Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    gender: Boolean,
    dob: Date,
    employment: {
        from: Date,
        to: Date
    },
    nationality: String,
    address: common_1.Address,
    clasification: {
        type: String,
        role: String
    }
});
// EmployeeSchema.methods.
// EmployeeSchema.statics.
function getEmployeeModel(m) {
    return m.model('Employee', EmployeeSchema, 'employees');
}
exports.getEmployeeModel = getEmployeeModel;
//# sourceMappingURL=Employee.js.map