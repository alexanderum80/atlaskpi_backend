import { IAppointmentDocument } from '../../../domain/app/appointments';
import { QueryBase } from '../../../framework/queries';
import { ListAppointmentsActivity } from '../activities/list-appointment.activity';
import { Appointments } from '../../../domain';
import { Appointment } from '../appointments.types';
import { query } from '../../../framework';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';

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
export class AppointmentsQuery extends QueryBase<IAppointmentDocument[]> {
    constructor(@inject('Appointments') private _appointments: Appointments) {
        super();
    }

    run(data: { start: string, end: string }): Promise<IAppointmentDocument[]> {
        return this._appointments.model.appointments(data.start, data.end);
    }
}
