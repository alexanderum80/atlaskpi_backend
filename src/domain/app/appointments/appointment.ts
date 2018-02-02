import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IAppointment {
    source?: string;
    externalId: string;
    fullName?: string;
    reason: string;
    from: Date;
    to?: Date;
    provider?:  string;
    state?: string;
    document?: {
        type: string; // invoice, bill, charge, etc
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
