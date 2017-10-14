// import { deleteAppointmentActivity } from '../../../../activities/app/appointments/delete-appointment.activity';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';

export interface IAppointment {
    from: Date;
    to: Date;
    name: string;
    description: string;
    states: string;
}

export interface IAppointmentDocument extends IAppointment, mongoose.Document {

}

export interface IAppointmentModel extends mongoose.Model<IAppointmentDocument> {
    createNew(from: Date, to: Date, name: string, description: string, states: string): Promise<IAppointmentDocument>;
    updateAppointment(id: string, from: Date, to: Date, name: string, description: string, states: string ): Promise<IAppointmentDocument>;
    appointments(): Promise<IAppointmentDocument[]>;
    appointmentById(id: string): Promise<IAppointmentDocument>;
    appointmentByDescription(from: Date, to: Date, name: string): Promise<IAppointmentDocument>;
    deleteAppointment(id: string): Promise<IAppointmentDocument>;
}
