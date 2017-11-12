import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IAppointmentDocument, IAppointmentModel } from '../../../models/app/appointments/IAppointment';

export class AppointmentByDescriptionQuery {
    constructor(public identity: IIdentity, private _IAppointmentModel: IAppointmentModel) {}

    run(data: any): Promise<IAppointmentDocument> {
        return this._IAppointmentModel.appointmentByDescription(data.from, data.to, data.name);
    }
}