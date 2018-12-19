import { inject, injectable } from 'inversify';
import { IScheduleJobInfo } from '../../../domain/app/schedule-job/schedule-job';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { CreateScheduleJobActivity } from '../activities/create-scheduleJob.activity';
import { ScheduleJobInput, ScheduleJobMutationResponse } from '../scheduleJob.types';
import { DashboardQuery } from '../../dashboards/queries/dashboard.query';
import { WidgetQuery } from '../../widgets/queries/widget.query';

@injectable()
@mutation({
    name: 'createScheduleJob',
    activity: CreateScheduleJobActivity,
    invalidateCacheFor: [ DashboardQuery, WidgetQuery ],
    parameters: [
        { name: 'input', type: ScheduleJobInput }
    ],
    output: { type: ScheduleJobMutationResponse }
})
export class CreateScheduleJobMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ScheduleJobService.name) private _scheduleJobService: ScheduleJobService) {
        super();
    }

    async run(data: {input: IScheduleJobInfo }): Promise<IMutationResponse> {
        return await this._scheduleJobService.addWidgetJob(data.input);
    }
}