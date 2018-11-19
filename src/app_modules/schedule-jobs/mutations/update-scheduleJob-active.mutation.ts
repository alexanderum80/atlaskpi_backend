import { ScheduleJobMutationResponse } from '../scheduleJob.types';
import { inject, injectable } from 'inversify';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { UpdateScheduleTaskActiveActivity } from '../activities/update-scheduleJob-active.activity';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';

@injectable()
@mutation({
    name: 'updateScheduleJobActive',
    activity: UpdateScheduleTaskActiveActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true },
        { name: 'active', type: GraphQLTypesMap.Boolean, required: true }
    ],
    output: { type: ScheduleJobMutationResponse }
})
export class UpdateScheduleJobActiveMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ScheduleJobService.name) private _scheduleJobService: ScheduleJobService
    ) {
        super();
    }

    async run(data: { id: string, active: boolean}): Promise<IMutationResponse> {
        return await this._scheduleJobService.setActive(data.id, data.active);
    }
}