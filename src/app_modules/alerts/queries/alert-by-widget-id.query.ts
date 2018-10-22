import { inject, injectable } from 'inversify';

import { IAlertDocument } from '../../../domain/app/alerts/alert';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { AlertByWidgetIdActivity } from '../activities/alert-by-widget-id.activity';
import { AlertResponse } from '../alerts.types';


@injectable()
@query({
    name: 'alertByWidgetId',
    cache: { ttl: 300 },
    activity: AlertByWidgetIdActivity,
    parameters: [
        { name: 'id', type: String, required: true }
    ],
    output: { type: AlertResponse, isArray: true }
})
export class AlertByWidgetIdQuery implements IQuery<IAlertDocument[]> {
    constructor(
        @inject(ScheduleJobService.name)
        private _scheduleJobService: ScheduleJobService
    ) {}

    async run(data: { id: string }): Promise<IAlertDocument[]> {
        return this._scheduleJobService.getJobsByIdentifier(data.id);
        // if (!data || !data.id) {
        //     Promise.reject({ name: 'no id provided', message: 'no id provided'});
        //     return;
        // }
        // return this._alert.model.alertByWidgetId(data.id);
    }
}