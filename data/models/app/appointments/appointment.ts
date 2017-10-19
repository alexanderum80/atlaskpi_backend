import { IAppointmentModel, IAppointmentDocument } from './IAppointment';
import * as mongoose from 'mongoose';
import * as logger from 'winston';


const AppointmentSchema = new mongoose.Schema({
    from: Date,
    to: Date,
    name: String,
    description: String,
    states: String
});

AppointmentSchema.statics.createNew = function(from: Date, to: Date, name: string, description: string, states: string): Promise<IAppointmentDocument> {
    const that = <IAppointmentModel> this;

    return new Promise<IAppointmentDocument>((resolve, reject) => {
        if (!from || !name || !description ) {
            return reject('Information not valid');
        }

        that.create({
            from: from,
            to: to,
            name: name,
            description: description,
            states: states

        }).then(appointment => {
            resolve(appointment);
        }).catch(err => {
            logger.error(err);
            reject('There was an error adding the appointment');
        });
    });
};

AppointmentSchema.statics.updateAppointment = function(_id: string, from: Date, to: Date, name: string, description: string, states: string): Promise<IAppointmentDocument> {
    const that = <IAppointmentModel> this;

    return new Promise<IAppointmentDocument>((resolve, reject) => {
        if (!from || !name || !description  ) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(_id, {
            from: from,
            to: to,
            name: name,
            description: description,
            states: states
        }).then(appointment => {
            resolve(appointment);
        }).catch(err => {
            logger.error(err);
            reject('There was an error updating the appointment');
        });
    });
};

AppointmentSchema.statics.deleteAppointment = function(_id: string): Promise<IAppointmentDocument> {
    const that = <IAppointmentModel> this;

    return new Promise<IAppointmentDocument>((resolve, reject) => {

        // that.findById(_id).then(appointment => {

            // if (appointment && appointment.name === 'Rafael') {
            //     return reject('Rafaels events cannot be deleted');
            // }

            that.findByIdAndRemove (_id).then(appointment => {
                resolve(appointment);
            }).catch(err => {
                logger.error(err);
                reject('There was an error updating the appointment');
            });

        // });

    });
};

AppointmentSchema.statics.appointments = function(): Promise<IAppointmentDocument[]> {
    const that = <IAppointmentModel> this;

    return new Promise<IAppointmentDocument[]>((resolve, reject) => {
        that.find({}).then(appointments => {
            resolve(appointments);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving appointments');
        });
    });
};

AppointmentSchema.statics.appointmentById = function(id: string): Promise<IAppointmentDocument> {
    const that = <IAppointmentModel> this;

    return new Promise<IAppointmentDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(appointment => {
            resolve(appointment);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving appointment');
        });
    });
};
AppointmentSchema.statics.appointmentByDescription = function(from: Date, to: Date, name: string): Promise<IAppointmentDocument> {
    const that = <IAppointmentModel> this;

    return new Promise<IAppointmentDocument>((resolve, reject) => {
        that.findOne({from: from, to: to, name: name}).then(appointment => {
            resolve(appointment);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving appointment');
        });
    });
};

export function getAppointmentModel(m: mongoose.Connection): IAppointmentModel {
    return <IAppointmentModel>m.model('Appointment', AppointmentSchema, 'appointments');
}