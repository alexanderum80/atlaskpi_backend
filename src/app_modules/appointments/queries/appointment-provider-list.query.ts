import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { IIdName } from './../../../domain/common/id-name';
import { IQuery } from './../../../framework/queries/query';
import { ListAppointmentProvidersActivity } from './../activities/list-appointment-providers.activity';
import { AppointmentResource } from './../appointments.types';

@injectable()
@query({
    name: 'appointmentProvidersList',
    activity: ListAppointmentProvidersActivity,
    output: { type: AppointmentResource, isArray: true }
})
export class AppointmentProvidersListQuery implements IQuery<IIdName[]> {
    constructor(
        @inject(Appointments.name) private _appointments: Appointments
    ) { }

    run(): Promise<IIdName[]> {
        return this._appointments.model.providersList();
    }
}
