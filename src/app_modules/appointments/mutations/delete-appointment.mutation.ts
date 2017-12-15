import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { DeleteAppointmentActivity } from '../activities/delete-appointment.activity';
import { AppointmentMutationResponse } from '../appointments.types';

@injectable()
@mutation({
    name: 'deleteAppointment',
    activity: DeleteAppointmentActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: AppointmentMutationResponse }
})
export class DeleteAppointmentMutation extends MutationBase<AppointmentMutationResponse> {
    constructor(@inject('Appointments') private _appointments: Appointments) {
        super();
    }

    run(data: { id: string }): Promise<AppointmentMutationResponse> {
        const that = this;

        return new Promise<AppointmentMutationResponse>((resolve, reject) => {
            that._appointments.model.deleteAppointment(data.id).then(appointment => {
                    resolve({
                        success: appointment !== null,
                        errors: appointment !== null ? [] : [{ field: 'general', errors: ['Apoointment not found'] }]
                    });
                    return;
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
                    return;
            });
            });
    }
}
