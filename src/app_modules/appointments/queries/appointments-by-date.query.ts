import { inject, injectable } from 'inversify';

import { IAppointmentDocument } from '../../../domain/app/appointments/appointment';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { query } from '../../../framework/decorators/query.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { AppointmentsByDateActivity } from '../activities/appointment-by-date.activity';
import { Appointment } from '../appointments.types';

@injectable()
@query({
    name: 'appointmentsByDate',
    activity: AppointmentsByDateActivity,
    parameters: [
        { name: 'date', type: String, required: true },
    ],
    output: { type: Appointment, isArray: true }
})
export class AppointmentsByDateQuery extends MutationBase<IAppointmentDocument[]> {
    constructor(@inject(Appointments.name) private _appointments: Appointments) {
        super();
    }

    run(data: { date: string }): Promise<IAppointmentDocument[]> {
        return this._appointments.model.appointmentsByDate(new Date(data.date));
    }
}
