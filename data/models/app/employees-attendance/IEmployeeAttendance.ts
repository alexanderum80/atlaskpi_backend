import * as mongoose from 'mongoose';

export interface IEmployeeAttendance {
    checkIn: {
        time: Date;
        exception: string;
    };
    checkOut: {
        time: Date;
        exception: string;
        type: string; // normal, short brake, long brake
    };
}

export interface IEmployeeAttendanceDocument extends mongoose.Document { }

export interface IEmployeeAttendanceModel extends mongoose.Model<IEmployeeAttendanceDocument> { }