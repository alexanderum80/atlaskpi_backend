import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { IIdName } from './../../../domain/common/id-name';
import { IQuery } from './../../../framework/queries/query';
import { AppointmentResource } from './../appointments.types';
import { ListAppointmentResourcesActivity } from '../activities/list-appointment-resources.activity';

@injectable()
@query({
    name: 'appointmentResourcesList',
    activity: ListAppointmentResourcesActivity,
    output: { type: AppointmentResource, isArray: true }
})
export class AppointmentResourcesListQuery implements IQuery<IIdName[]> {
    constructor(
        @inject(Appointments.name) private _appointments: Appointments
    ) { }

    run(): Promise<IIdName[]> {
        return this._appointments.model.resourcesList();
    }
}
