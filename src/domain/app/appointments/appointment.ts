import { BaseModel } from './../../common/base.model';
import { IEntity } from './../sales/sale';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IAppointmentEvent extends IEntity {
    code: string;
    color: string;
    conflictColor: string;
    cancelledColor: string;
}

export interface IAppointment extends BaseModel {
    // Appointment
    reason: string;
    comments: string;
    from: Date;
    to?: Date;
    duration: number;
    approved: boolean;
    checkedIn: boolean;
    checkedOut: boolean;
    cancelled: boolean;
    checkedInOn: Date;
    checkedOutOn: Date;
    cancelledOn: Date;
    confirmedOn: Date;
    createdOn: Date;
    customer: IEntity;
    provider: IEntity[];
    location: IEntity;

    event: IAppointmentEvent;

    document: {
        type: string, // invoice, bill, charge, etc
        identifier: string
    };
}
export interface IAppointmentDocument extends IAppointment, mongoose.Document {

}

export interface IAppointmentModel extends mongoose.Model<IAppointmentDocument> {
    createNew(input: IAppointment): Promise<IAppointmentDocument>;
    updateAppointment(id: string, input: IAppointment): Promise<IAppointmentDocument>;
    appointments(start: string, end: string): Promise<IAppointmentDocument[]>;
    appointmentById(id: string): Promise<IAppointmentDocument>;
    appointmentByDescription(from: Date, to: Date, name: string): Promise<IAppointmentDocument>;
    appointmentsByDate(date: Date): Promise<IAppointmentDocument[]>;
    deleteAppointment(id: string): Promise<IAppointmentDocument>;
}
