import { ISearchableModel } from '../global-search/global-search';
import * as mongoose from 'mongoose';

import { SearchAppointmentCriteriaInput } from './../../../app_modules/appointments/appointments.types';
import { BaseModel } from './../../common/base.model';
import { IIdName } from './../../common/id-name';
import { IEntity } from './../sales/sale';
import { ICriteriaSearchable } from '../../../app_modules/shared/criteria.plugin';

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

export interface IAppointmentResource extends IEntity {
    type: String;
}

export interface IAppointmentLocation extends IEntity {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
}

export interface IAppointmentProcedure extends IEntity {
    converted: boolean;
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
    provider: IAppointmentResource[];
    location: IAppointmentLocation;
    procedure: IAppointmentProcedure[];
    referral: IEntity;
    date: Date;
    converted: Boolean;
    appointmentType: string;

    event: IAppointmentEvent;

    resource: IAppointmentResource[];

    document: {
        type: string, // invoice, bill, charge, etc
        identifier: string
    };
}
export interface IAppointmentDocument extends IAppointment, mongoose.Document {

}

export interface IAppointmentModel extends mongoose.Model<IAppointmentDocument>, ISearchableModel, ICriteriaSearchable {
    createNew(input: IAppointment): Promise<IAppointmentDocument>;
    updateAppointment(id: string, input: IAppointment): Promise<IAppointmentDocument>;
    appointments(start: string, end: string): Promise<IAppointmentDocument[]>;
    appointmentById(id: string): Promise<IAppointmentDocument>;
    appointmentByDescription(from: Date, to: Date, name: string): Promise<IAppointmentDocument>;
    appointmentsByDate(date: Date): Promise<IAppointmentDocument[]>;
    deleteAppointment(id: string): Promise<IAppointmentDocument>;

    search(criteria: SearchAppointmentCriteriaInput): Promise<IAppointment[]>;
    providersList(): Promise<IIdName[]>;
    resourcesList(): Promise<IIdName[]>;
}
