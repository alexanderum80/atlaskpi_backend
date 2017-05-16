import { IEmployeeAttendanceModel } from './IEmployeeAttendance';
import * as mongoose from 'mongoose';

let Schema = mongoose.Schema;
let EmployeeAttendanceSchema = new Schema({
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

export function getEmployeeAttendanceModel(m: mongoose.Connection): IEmployeeAttendanceModel {
    return <IEmployeeAttendanceModel>m.model('EmployeeAttendance', EmployeeAttendanceSchema, 'employeeAttendance');
}
