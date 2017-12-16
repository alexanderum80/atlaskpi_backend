import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { CreateAppointmentActivity } from '../activities/create-appointment.activity';
import { AppointmentInput, AppointmentMutationResponse } from '../appointments.types';

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
    constructor(@inject(Appointments.name) private _appointments: Appointments) {
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
