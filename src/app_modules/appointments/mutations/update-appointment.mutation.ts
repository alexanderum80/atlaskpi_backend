import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppointment } from '../../../domain/app/appointments/appointment';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { UpdateAppointmentActivity } from '../activities/update-appointment.activity';
import { AppointmentInput, AppointmentMutationResponse } from '../appointments.types';

@injectable()
@mutation({
    name: 'updateAppointment',
    activity: UpdateAppointmentActivity,
    parameters: [
        { name: 'id', type: String, required: true },
        { name: 'input', type: AppointmentInput },
    ],
    output: { type: AppointmentMutationResponse }
})
export class UpdateAppointmentMutation extends MutationBase<AppointmentMutationResponse> {
    constructor(@inject(Appointments.name) private _appointments: Appointments) {
        super();
    }

    run(data: { id: string, input: IAppointment }): Promise<AppointmentMutationResponse> {
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
