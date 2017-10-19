import { IAppointmentModel } from '../../../models/app/appointments/IAppointment';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class CreateAppointmentMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _AppointmentModel: IAppointmentModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._AppointmentModel.createNew(data.from, data.to, data.name, data.description, data.states).then(appointment => {
                resolve({
                    success: true,
                    entity: appointment
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error creating the appointment']
                        }
                    ]
                });
           });
        });
    }
}
