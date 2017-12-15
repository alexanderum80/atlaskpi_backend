import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IAppointmentDocument } from '../../../domain/app/appointments/appointment';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { AppointmentByIdActivity } from '../activities/appointment-by-id.activity';
import { Appointment } from '../appointments.types';

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
    constructor(@inject('Appointments') private _appointments: Appointments) { }

    run(data: { id: string }): Promise<IAppointmentDocument> {
        return this._appointments.model.appointmentById(data.id);
    }
}
