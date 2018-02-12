import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IIdName } from './../../../domain/common/id-name';
import { IQuery } from './../../../framework/queries/query';
import { AppointmentsService } from './../../../services/appointments.service';
import { ListAppointmentProvidersActivity } from './../activities/list-appointment-providers.activity';
import { AppointmentProvider } from './../appointments.types';

@injectable()
@query({
    name: 'appointmentProvidersList',
    activity: ListAppointmentProvidersActivity,
    output: { type: AppointmentProvider, isArray: true }
})
export class AppointmentProvidersListQuery implements IQuery<IIdName[]> {
    constructor(
        @inject(AppointmentsService.name) private _appointmentsService: AppointmentsService
    ) { }

    run(): Promise<IIdName[]> {
        return this._appointmentsService.providersList();
    }
}
