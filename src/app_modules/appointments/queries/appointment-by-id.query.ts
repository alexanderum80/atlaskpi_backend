import { QueryBase } from '../../../framework/queries';
import { IAppointmentDocument } from '../../../domain/app/appointments';
import { AppointmentByIdActivity } from '../activities/appointment-by-id.activity';
import { Appointments } from '../../../domain';
import { Appointment } from '../appointments.types';
import { MutationBase, query } from '../../../framework';
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';

@injectable()
@query({
    name: 'appointmentById',
    activity: AppointmentByIdActivity,
    parameters: [
        { name: 'id', type: String, required: true },
    ],
    output: { type: Appointment }
})
export class AppointmentByIdQuery implements IQuery<IAppointmentDocument> {
    constructor(@inject('Appointments') private _appointments: Appointments) {
        
    }

    run(data: { id: string }): Promise<IAppointmentDocument> {
        return this._appointments.model.appointmentById(data.id);
    }
}
