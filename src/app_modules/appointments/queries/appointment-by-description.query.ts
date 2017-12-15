import { from } from 'apollo-link/lib';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppointmentDocument } from '../../../domain/app/appointments/appointment';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { AppointmentByDescriptionActivity } from '../activities/appointment-by-description.activity';
import { Appointment } from '../appointments.types';

@injectable()
@query({
    name: 'appointmentByDescription',
    activity: AppointmentByDescriptionActivity,
    parameters: [
        { name: 'from', type: String, required: true },
        { name: 'to', type: String, required: true },
        { name: 'name', type: String, required: true },
    ],
    output: { type: Appointment }
})
export class AppointmentByDescriptionQuery extends MutationBase<IAppointmentDocument> {
    constructor(@inject('Appointments') private _appointments: Appointments) {
        super();
    }

    run(data: { from: string, to: string, name: string }): Promise<IAppointmentDocument> {
        return this._appointments.model.appointmentByDescription(new Date(data.from), new Date(data.to), data.name);
    }
}
