import { IAppointment } from './../../../models/app/appointments/IAppointment';
import { IAppointmentModel } from '../../../models/app/appointments/IAppointment';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class UpdateAppointmentMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _AppointmentModel: IAppointmentModel) {
            super(identity);
        }

    run(data: { id: string, input: IAppointment }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._AppointmentModel.updateAppointment(data.id, data.input).then(appointment => {
                resolve({
                    success: true,
                    entity: appointment
                });
                return;
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating the appointment']
                        }
                    ]
                });
                return;
           });
        });
    }
}
