import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';

import { SearchAppointmentCriteriaInput } from './../../../app_modules/appointments/appointments.types';
import { BaseModel } from './../../common/base.model';
import { IIdName } from './../../common/id-name';
import { IEntity } from './../sales/sale';

export interface IAppointmentEvent extends IEntity {
    code: string;
    color: string;
    conflictColor: string;
    cancelledColor: string;
}

export interface IAppointmentCustomer extends IEntity {
    city: string;
    state: string;
    zip: string;
    gender: string;
    dob: Date;
    address: string;
    fullname: string;
}

export interface IAppointmentProvider extends IEntity {
    providerType: String;
}

export interface IAppointmentLocation extends IEntity {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
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
    noShow: boolean;
    checkedInOn: Date;
    checkedOutOn: Date;
    cancelledOn: Date;
    confirmedOn: Date;
    createdOn: Date;
    noShowOn: Date;
    customer: IAppointmentCustomer;
    provider: IAppointmentProvider[];
    location: IAppointmentLocation;
    referal: IEntity;
    date: Date;
    converted: Boolean;
    appointmentType: string;

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

    search(criteria: SearchAppointmentCriteriaInput): Promise<IAppointment[]>;
    providersList(): Promise<IIdName[]>;
    findCriteria(field: string, limit?: number, filter?: string): Promise<string[]>;
}
