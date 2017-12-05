import { Appointments, IAppointment } from '../../../domain/app/appointments';
import { UpdateAppointmentActivity } from '../activities/update-appointment.activity';
import { MutationBase } from '../../../framework/mutations';
import { AppointmentInput, AppointmentMutationResponse } from '../appointments.types';
import { CreateAppointmentActivity } from '../activities';
import { mutation } from '../../../framework';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';

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
    constructor(@inject('Appointments') private _appointments: Appointments) {
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
