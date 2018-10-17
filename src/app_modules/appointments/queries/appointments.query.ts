import { inject, injectable } from 'inversify';

import { IAppointmentDocument } from '../../../domain/app/appointments/appointment';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListAppointmentsActivity } from '../activities/list-appointment.activity';
import { Appointment } from '../appointments.types';

@injectable()
@query({
    name: 'appointments',
    activity: ListAppointmentsActivity,
    parameters: [
        { name: 'start', type: String, required: true },
        { name: 'end', type: String, required: true },
    ],
    output: { type: Appointment, isArray: true }
})
export class AppointmentsQuery implements IQuery<IAppointmentDocument[]> {
    constructor(@inject(Appointments.name) private _appointments: Appointments) { }

    run(data: { start: string, end: string }): Promise<IAppointmentDocument[]> {
        return this._appointments.model.appointments(data.start, data.end);
    }
}
