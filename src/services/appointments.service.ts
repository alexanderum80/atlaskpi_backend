import { isEmpty } from 'lodash';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as moment from 'moment';

import { SearchAppointmentCriteriaInput } from '../app_modules/appointments/appointments.types';
import { Appointments } from '../domain/app/appointments/appointment-model';
import { Logger } from '../domain/app/logger';
import { IAppointment } from './../domain/app/appointments/appointment';
import { IIdName } from './../domain/common/id-name';

const distinctProvidersPipeline = [
    { '$unwind': '$provider' },
    { '$match' : { 'provider.externalId' : { '$ne' : null }}},
    { '$group': { '_id': { externalId: '$provider.externalId', name: '$provider.name' } } },
    { '$project': { _id: 0, externalId: '$_id.externalId', name: '$_id.name' } }
];

@injectable()
export class AppointmentsService {

    constructor(
        @inject(Appointments.name) private _appointments: Appointments,
        @inject(Logger.name) private _logger: Logger
    ) { }

    search(criteria: SearchAppointmentCriteriaInput): Promise<IAppointment[]> {
        const query = {};

        if (criteria) {
            // date criterias
            if (criteria.date) {
                const startOfDay = moment(criteria.date).startOf('day');
                const endOfDay = moment(criteria.date).add(1, 'day').startOf('day');
                query['from'] = {
                    '$gte': startOfDay,
                    '$lt': endOfDay
                };
            } else if (criteria.startDate && criteria.endDate) {
                query['from'] = {
                    '$gte': criteria.startDate,
                    '$lt': criteria.endDate
                };
            } else {
                // if no date specified get this month
                query['from'] = {
                    '$gte': moment().startOf('month'),
                    '$lt': moment().endOf('month')
                };
            }

            // provider criteria
            if (criteria.provider && criteria.provider.length && !isEmpty(criteria.provider[0])) {
                query['provider.externalId'] = {
                    '$in': criteria.provider,
                };
            }
            // lets keeps adding criterias like cancelled, location, etc...
        } else {
            // if no date specified get this month
            query['from'] = {
                '$gte': moment().startOf('month'),
                '$lt': moment().endOf('month')
            };
        }

        const that = this;
        return new Promise <IAppointment[]>((resolve, reject) => {
            that._appointments.model.find(query).sort({ from: 1 }).then(appointments => {
                resolve(appointments);
                return;
            }).catch(err => {
                that._logger.error(err);
                return reject('There was an error retrieving appointments');
            });
        });
    }

    providersList(): Promise<IIdName[]> {
        const that = this;
        return new Promise <IIdName[]>((resolve, reject) => {
            that._appointments.model.aggregate(distinctProvidersPipeline).then(providers => {
                resolve(<any>providers);
                return;
            }).catch(err => {
                that._logger.error(err);
                return reject('There was an error retrieving appointments');
            });
        });
    }
}
