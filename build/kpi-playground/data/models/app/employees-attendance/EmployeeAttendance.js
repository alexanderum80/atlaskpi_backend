"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var EmployeeAttendanceSchema = new Schema({
    checkIn: {
        time: Date,
        exception: String
    },
    checkOut: {
        time: Date,
        exception: String,
        type: String
    }
});
function getEmployeeAttendanceModel(m) {
    return m.model('EmployeeAttendance', EmployeeAttendanceSchema, 'employeeAttendance');
}
exports.getEmployeeAttendanceModel = getEmployeeAttendanceModel;
//# sourceMappingURL=EmployeeAttendance.js.map