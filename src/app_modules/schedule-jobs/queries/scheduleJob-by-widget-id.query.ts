import { inject, injectable } from 'inversify';
import { IScheduleJobDocument } from '../../../domain/app/schedule-job/schedule-job';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { ScheduleJobByWidgetIdActivity } from '../activities/scheduleJob-by-widget-id.activity';
import { ScheduleJobResponse } from '../scheduleJob.types';


@injectable()
@query({
    name: 'scheduleJobByWidgetId',
    cache: { ttl: 1800 },
    activity: ScheduleJobByWidgetIdActivity,
    parameters: [
        { name: 'id', type: String, required: true }
    ],
    output: { type: ScheduleJobResponse, isArray: true }
})
export class ScheduleJobByWidgetIdQuery implements IQuery<IScheduleJobDocument[]> {
    constructor(
        @inject(ScheduleJobService.name)
        private _scheduleJobService: ScheduleJobService
    ) {}

    async run(data: { id: string }): Promise<IScheduleJobDocument[]> {
        return this._scheduleJobService.getJobsByIdentifier(data.id);
    }
}