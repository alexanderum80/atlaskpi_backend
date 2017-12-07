import { IAppointmentDocument } from '../../../domain/app/appointments';
import { Appointments } from '../../../domain';
import { Appointment } from '../appointments.types';
import { AppointmentByDescriptionActivity } from '../activities/appointment-by-description.activity';
import { MutationBase, query } from '../../../framework';
import { CreateAppointmentActivity } from '../activities';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';

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
        
    }

    run(data: { from: string, to: string, name: string }): Promise<IAppointmentDocument> {
        return this._appointments.model.appointmentByDescription(new Date(data.from), new Date(data.to), data.name);
    }
}
