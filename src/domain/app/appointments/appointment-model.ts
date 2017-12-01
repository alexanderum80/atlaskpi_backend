import {
    ModelBase
} from '../../../type-mongo';
import {
    AppConnection
} from '../app.connection';
import {
    injectable,
    inject
} from 'inversify';
import {
    IAppointment,
    IAppointmentDocument,
    IAppointmentModel
} from './appointment';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import * as moment from 'moment';

const AppointmentSchema = new mongoose.Schema({
    source: String,
    externalId: {
        type: String,
        unique: true
    },
    fullName: String,
    reason: String,
    from: Date,
    to: Date,
    provider: String
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

@injectable()
export class Appointments extends ModelBase < IAppointmentModel > {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super(appConnection, 'Appointment', AppointmentSchema, 'appointments');
    }
}