import { criteriaPlugin } from '../../../app_modules/shared/criteria.plugin';
import { inject, injectable } from 'inversify';
import { isEmpty, isBoolean } from 'lodash';
import * as moment from 'moment';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { SearchAppointmentCriteriaInput } from './../../../app_modules/appointments/appointments.types';
import { IIdName } from './../../common/id-name';
import { IAppointment, IAppointmentDocument, IAppointmentModel } from './appointment';
import { getCustomerSchema } from '../../common/customer.schema';
import { searchPlugin } from '../global-search/global-search.plugin';
import { AKPIDateFormatEnum } from '../../common/date-range';

const distinctProvidersPipeline = [
    { '$unwind': '$provider' },
    { '$match' : { 'provider.externalId' : { '$ne' : null }}},
    { '$group': { '_id': { externalId: '$provider.externalId', name: '$provider.name' } } },
    { '$project': { _id: 0, externalId: '$_id.externalId', name: '$_id.name' } }
];

const distinctResourcesPipeline = [
    { '$unwind': '$resource' },
    { '$match' : { 'resource.externalId' : { '$ne' : null }}},
    { '$group': { '_id': { externalId: '$resource.externalId', name: '$resource.name' } } },
    { '$project': { _id: 0, externalId: '$_id.externalId', name: '$_id.name' } }
];

const EntitySchema = {
    externalId: String,
    name: String
};

const AppointmentCustomerSchema = {
    ...EntitySchema,
    city: String,
    state: String,
    zip: String,
    gender: String,
    dob: Date,
    address: String,
    fullname: String
};

const EventSchema = {
    ...EntitySchema,
    code: String,
    color: String,
    conflictColor: String,
    cancelledColor: String
};

const AppoitnmentCustomerSchema = {
    externalId: String,
    city: String,
    state: String,
    zip: String,
    gender: String,
    dob: Date,
    address: String,
    fullname: String
};

const ResourceSchema = {
    externalId: String,
    name: String,
    type: { type: String }
};

const AppointmentProcedureSchema = {
    ...EntitySchema,
    converted: Boolean
};

const AppointmentLocationSchema = {
    externalId: String,
    name: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
};

export const AppointmentSchema = new mongoose.Schema({
    // appointment
    externalId: String,
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
    noShow: Boolean,
    checkedInOn: Date,
    checkedOutOn: Date,
    cancelledOn: Date,
    confirmedOn: Date,
    createdOn: Date,
    noShowOn: Date,
    customer: AppoitnmentCustomerSchema,
    provider: [ ResourceSchema ],
    location: { ...AppointmentLocationSchema },
    event: { ...EventSchema },
    procedure: [ AppointmentProcedureSchema ],
    referral: { ...EntitySchema },
    date: Date,
    converted: Boolean,
    appointmentType: String,
    resource: [ ResourceSchema ],
    document: {
        type: String, // invoice, bill, charge, etc
        identifier: String
    }
});

// INDEXES
AppointmentSchema.index({ 'from': 1 });
AppointmentSchema.index({ 'from': 1, 'provider.name': 1 });
AppointmentSchema.index({ 'from': 1, 'location.name': 1 });
AppointmentSchema.index({ 'from': 1, 'event.code': 1 });
AppointmentSchema.index({ 'from': 1, 'event.name': 1 });
AppointmentSchema.index({ 'from': 1, 'source': 1 });

AppointmentSchema.plugin(criteriaPlugin);
AppointmentSchema.plugin(searchPlugin);

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

AppointmentSchema.statics.search = function(criteria: SearchAppointmentCriteriaInput): Promise<IAppointment[]> {
    const query = {};

    let from: moment.Moment;
    let to: moment.Moment;

    if (criteria) {
        // date
        if (criteria.date) {
            from = moment.tz(criteria.date, AKPIDateFormatEnum.US_DATE, criteria.timezone).startOf('day');
            to = moment.tz(criteria.date, AKPIDateFormatEnum.US_DATE, criteria.timezone).add(1, 'day').startOf('day');
        } else if (criteria.startDate && criteria.endDate) {
            from = moment(criteria.startDate);
            to = moment(criteria.endDate);
        } else {
            const rightNow = moment();
            from = rightNow.startOf('month');
            to = rightNow.endOf('month');
        }

        query['from'] = {
            '$gte': from,
            '$lt': to
        };

        const criteriaArrayFields = [ 'provider', 'resource'];

        for (const c of criteriaArrayFields) {
            if (criteria[c] && criteria[c].length && !isEmpty(criteria[c][0])) {
                query[`${c}.externalId`] = {
                    '$in': criteria[c],
                };
            }
        }

        if (isBoolean(criteria.cancelled) && criteria.cancelled === false) {
            query['cancelled'] = criteria.cancelled;
        }
    }

    const that = this;
    return new Promise <IAppointment[]>((resolve, reject) => {
        that.find(query).sort({ from: 1 }).then(appointments => {
            resolve(appointments);
            return;
        }).catch(err => {
            that._logger.error(err);
            return reject('There was an error retrieving appointments');
        });
    });
};

AppointmentSchema.statics.providersList = function(): Promise<IIdName[]> {
    const that = this;
    return new Promise <IIdName[]>((resolve, reject) => {
        that.aggregate(distinctProvidersPipeline).then(providers => {
            resolve(<any>providers);
            return;
        }).catch(err => {
            that._logger.error(err);
            return reject('There was an error retrieving appointments-providers');
        });
    });
};

AppointmentSchema.statics.resourcesList = function(): Promise<IIdName[]> {
    const that = this;
    return new Promise <IIdName[]>((resolve, reject) => {
        that.aggregate(distinctResourcesPipeline).then(resources => {
            resolve(<any>resources);
            return;
        }).catch(err => {
            that._logger.error(err);
            return reject('There was an error retrieving appointments-resources');
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