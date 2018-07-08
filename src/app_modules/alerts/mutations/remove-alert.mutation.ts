import { inject, injectable } from 'inversify';

import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { RemoveAlertActivity } from '../activities/remove-alert.activity';
import { AlertMutationResponse } from '../alerts.types';

@injectable()
@mutation({
    name: 'removeAlert',
    activity: RemoveAlertActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true }
    ],
    output: { type: AlertMutationResponse }
})
export class RemoveAlertMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ScheduleJobService.name)
        private _scheduleJobService: ScheduleJobService
    ) {
        super();
    }

    async run(data: { id: string}): Promise<IMutationResponse> {
        return this._scheduleJobService.removeJob(data.id);
        // try {
        //     const removeAlert = await this._alert.model.removeAlert(data.id);
        //     return { success: true, entity: removeAlert };
        // } catch (err) {
        //     return {
        //         errors: [{ field: '', errors: ['There was error removing the alert'] }]
        //     };
        // }
    }
}