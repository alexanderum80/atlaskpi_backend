import { ModelBase } from '../../../type-mongo';
import { AppConnection } from '../app.connection';
import { injectable, inject } from 'inversify';
import { IEmployeeAttendanceModel } from './employee-attendance';
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

@injectable()
export class EmployeeAttendance extends ModelBase<IEmployeeAttendanceModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super(appConnection, 'EmployeeAttendance', EmployeeAttendanceSchema, 'employeeAttendance');
    }
}
