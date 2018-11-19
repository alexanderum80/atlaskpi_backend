import { inject, injectable } from 'inversify';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { RemoveScheduleJobActivity } from '../activities/remove-scheduleJob.activity';
import { ScheduleJobMutationResponse } from '../scheduleJob.types';
import { DashboardQuery } from '../../dashboards/queries/dashboard.query';

@injectable()
@mutation({
    name: 'removeScheduleJob',
    activity: RemoveScheduleJobActivity,
    invalidateCacheFor: [ DashboardQuery ],
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: ScheduleJobMutationResponse }
})
export class RemoveScheduleJobMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ScheduleJobService.name) private _scheduleJobService: ScheduleJobService
    ) {
        super();
    }

    async run(data: { id: string}): Promise<IMutationResponse> {
        return this._scheduleJobService.removeJob(data.id);
    }
}