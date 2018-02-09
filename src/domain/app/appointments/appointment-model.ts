import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import * as moment from 'moment';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IAppointment, IAppointmentDocument, IAppointmentModel } from './appointment';

const EntitySchema = {
    externalId: String,
    name: String
};

const EventSchema = {
    ...EntitySchema,
    code: String,
    color: String,
    conflictColor: String,
    cancelledColor: String
};

const AppointmentSchema = new mongoose.Schema({
    // appointment
    source: String,
    reason: String,
    comments: String,
    from: Date,
    to: Date,
    duration: Number,
    approved: Boolean,
    checkedIn: Boolean,
    checkedOut: Boolean,
    cancelled: Boolean,
    checkedInOn: Date,
    checkedOutOn: Date,
    cancelledOn: Date,
    confirmedOn: Date,
    createdOn: Date,
    customer: { ...EntitySchema },
    provider: [ EntitySchema ],
    location: { ...EntitySchema },
    event: { ...EventSchema },
    document: {
        type: String, // invoice, bill, charge, etc
        identifier: String
    }
});


AppointmentSchema.statics.createNew = function(input: IAppointment): Promise < IAppointmentDocument > {
    const that = < IAppointmentModel > this;

    return new Promise < IAppointmentDocument > ((resolve, reject) => {
        if (!input || !input.reason || !input.from) {
            return reject('Information not valid');
        }

        input.source = 'AtlasKPI';

        that.create(input).then(appointment => {
            resolve(appointment);
            return;
        }).catch(err => {
            logger.error(err);
            return reject('There was an error adding the appointment');
        });
    });
};

AppointmentSchema.statics.updateAppointment = function(id: string, input: IAppointment): Promise < IAppointmentDocument > {
    const that = < IAppointmentModel > this;

    return new Promise < IAppointmentDocument > ((resolve, reject) => {
        if (!id || !input || !input.reason || !input.from) {
            return reject('Information not valid');
        }

        that.findByIdAndUpdate(id, input).then(appointment => {
            resolve(appointment);
            return;
        }).catch(err => {
            logger.error(err);
            return reject('There was an error updating the appointment');
        });
    });
};

AppointmentSchema.statics.deleteAppointment = function(id: string): Promise < IAppointmentDocument > {
    const that = < IAppointmentModel > this;

    return new Promise < IAppointmentDocument > ((resolve, reject) => {

        that.findByIdAndRemove(id).then(appointment => {
            resolve(appointment);
            return;
        }).catch(err => {
            logger.error(err);
            return reject('There was an error updating the appointment');
        });
    });
};

AppointmentSchema.statics.appointments = function(start: string, end: string): Promise < IAppointmentDocument[] > {
    const that = < IAppointmentModel > this;
    console.log(start + '-' + end);
    return new Promise < IAppointmentDocument[] > ((resolve, reject) => {
        that.find({
            'from': {
                '$gte': start,
                '$lte': end
            }
        }).then(appointments => {
            resolve(appointments);
            return;
        }).catch(err => {
            logger.error(err);
            return reject('There was an error retrieving appointments');
        });
    });
};

AppointmentSchema.statics.appointmentById = function(id: string): Promise < IAppointmentDocument > {
    const that = < IAppointmentModel > this;

    return new Promise < IAppointmentDocument > ((resolve, reject) => {
        that.findOne({
            _id: id
        }).then(appointment => {
            if (!appointment) {
                return reject('Appointment not found');
            }

            resolve(appointment);
            return;
        }).catch(err => {
            logger.error(err);
            return reject('There was an error retrieving appointment');
        });
    });
};

AppointmentSchema.statics.appointmentByDescription = function(from: Date, to: Date, name: string): Promise < IAppointmentDocument > {
    const that = < IAppointmentModel > this;

    return new Promise < IAppointmentDocument > ((resolve, reject) => {
        that.findOne({
            from: from,
            to: to,
            name: name
        }).then(appointment => {
            resolve(appointment);
            return;
        }).catch(err => {
            logger.error(err);
            return reject('There was an error retrieving appointment');
        });
    });
};

AppointmentSchema.statics.appointmentsByDate = function(date: Date): Promise<IAppointmentDocument[]> {
    const that = < IAppointmentModel > this;

    if (!date) {
        throw new Error('Appointments by date required a valid date');
    }

    const startOfDay = moment(date).startOf('day');
    const endOfDay = moment(date).add(1, 'day').startOf('day');

    return new Promise < IAppointmentDocument[] > ((resolve, reject) => {
        that.find({
            from: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).sort({ from: 1 }).then(appointments => {
            resolve(appointments);
            return;
        }).catch(err => {
            logger.error(err);
            return reject('There was an error retrieving appointments by date');
        });
    });
};

@injectable()
export class Appointments extends ModelBase < IAppointmentModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Appointment', AppointmentSchema, 'appointments');
    }
}