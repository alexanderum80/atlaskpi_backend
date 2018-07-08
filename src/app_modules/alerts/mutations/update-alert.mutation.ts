import { inject, injectable } from 'inversify';

import { IAlertInfo } from '../../../domain/app/alerts/alert';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { UpdateAlertActivity } from '../activities/update-alert.activity';
import { AlertInput, AlertMutationResponse } from '../alerts.types';

@injectable()
@mutation({
    name: 'updateAlert',
    activity: UpdateAlertActivity,
    parameters: [
        { name: 'id', type: GraphQLTypesMap.String, required: true },
        { name: 'input', type: AlertInput }
    ],
    output: { type: AlertMutationResponse }
})
export class UpdateAlertMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ScheduleJobService.name)
        private _scheduleJobService: ScheduleJobService
    ) {
        super();
    }

    async run(data: { id: string, input: IAlertInfo }): Promise<IMutationResponse> {
        return await this._scheduleJobService.update(data.id, data.input);
        // const that = this;

        // return new Promise<IMutationResponse>((resolve, reject) => {
        //     that._alert.model.updateAlert(data.id, data.input)
        //         .then((response: IAlertDocument) => {
        //             resolve({ success: true, entity: response });
        //             return;
        //         })
        //         .catch(err => {
        //             reject({ success: false, errors: [{ field: 'alert', errors: err }] });
        //             return;
        //         });
        // });
    }
}