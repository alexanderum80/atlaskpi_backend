import { inject, injectable } from 'inversify';

import { IAppointment } from '../../../domain/app/appointments/appointment';
import { Appointments } from '../../../domain/app/appointments/appointment-model';
import { query } from '../../../framework/decorators/query.decorator';
import { Appointment } from '../appointments.types';
import { IQuery } from './../../../framework/queries/query';
import { SearchAppointmentsActivity } from './../activities/search-appointments.activity';
import { SearchAppointmentCriteriaInput } from './../appointments.types';
import { CurrentUser } from '../../../domain/app/current-user';

@injectable()
@query({
    name: 'searchAppointments',
    activity: SearchAppointmentsActivity,
    parameters: [
        { name: 'criteria', type: SearchAppointmentCriteriaInput },
    ],
    output: { type: Appointment, isArray: true }
})
export class SearchAppointmentsQuery implements IQuery<IAppointment[]> {
    constructor(
        @inject(Appointments.name) private _appointments: Appointments,
        @inject(CurrentUser.name) private _user: CurrentUser
    ) { }

    run(data: { criteria: SearchAppointmentCriteriaInput }): Promise<IAppointment[]> {
        data.criteria.timezone = this._user.get().profile.timezone;
        return this._appointments.model.search(data.criteria);
    }
}