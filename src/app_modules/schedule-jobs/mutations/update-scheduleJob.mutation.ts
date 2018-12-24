import { inject, injectable } from 'inversify';
import { IScheduleJobInfo } from '../../../domain/app/schedule-job/schedule-job';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { UpdateScheduleJobActivity } from '../activities/update-scheduleJob.activity';
import { ScheduleJobInput, ScheduleJobMutationResponse } from '../scheduleJob.types';

@injectable()
@mutation({
    name: 'updateScheduleJob',
    activity: UpdateScheduleJobActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true },
        { name: 'input', type: ScheduleJobInput }
    ],
    output: { type: ScheduleJobMutationResponse }
})
export class UpdateScheduleJobMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ScheduleJobService.name) private _scheduleJobService: ScheduleJobService
    ) {
        super();
    }

    async run(data: { id: string, input: IScheduleJobInfo }): Promise<IMutationResponse> {
        return await this._scheduleJobService.update(data.id, data.input);
    }
}