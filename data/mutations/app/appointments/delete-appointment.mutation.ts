import { IAppointmentModel } from '../../../models/app/appointments/IAppointment';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class DeleteAppointmentMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _AppointmentModel: IAppointmentModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._AppointmentModel.deleteAppointment(data._id).then(appointment => {
                resolve({
                    success: appointment !== null,
                    errors: appointment !== null ? [] : [{ field: 'general', errors: ['Apoointment not found'] }]
                });
           }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error deleting the appointment']
                        }
                    ]
                });
           });
        });
    }
}
