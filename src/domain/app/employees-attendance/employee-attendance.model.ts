import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IEmployeeAttendanceModel } from './employee-attendance';

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
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'EmployeeAttendance', EmployeeAttendanceSchema, 'employeeAttendance');
    }
}
