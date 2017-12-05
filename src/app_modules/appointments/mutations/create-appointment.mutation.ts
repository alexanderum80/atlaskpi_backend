import { Appointments } from '../../../domain/app/appointments';
import { MutationBase } from '../../../framework/mutations';
import { AppointmentInput, AppointmentMutationResponse } from '../appointments.types';
import { CreateAppointmentActivity } from '../activities';
import { mutation } from '../../../framework';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';

@injectable()
@mutation({
    name: 'createAppointment',
    activity: CreateAppointmentActivity,
    parameters: [
        { name: 'input', type: AppointmentInput },
    ],
    output: { type: AppointmentMutationResponse }
})
export class CreateAppointmentMutation extends MutationBase<AppointmentMutationResponse> {
    constructor(@inject('Appointments') private _appointments: Appointments) {
        super();
    }

    run(data: any): Promise<AppointmentMutationResponse> {
        const that = this;

        return new Promise<AppointmentMutationResponse>((resolve, reject) => {
            that._appointments.model.createNew(data.input).then(appointment => {
                resolve({
                    success: true,
                    entity: appointment as any
                });
                return;
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
                return;
            });
        });
    }
}
