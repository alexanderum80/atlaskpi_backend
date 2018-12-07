import { inject, injectable } from 'inversify';

import { IAlertDocument, IAlertInfo } from '../../../domain/app/alerts/alert';
import { Alerts } from '../../../domain/app/alerts/alert.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { ScheduleJobService } from '../../../services/schedule-jobs/schedule-job.service';
import { CreateAlertActivity } from '../activities/create-alert.activity';
import { AlertInput, AlertMutationResponse } from '../alerts.types';
import { DashboardQuery } from '../../dashboards/queries/dashboard.query';
import { WidgetQuery } from '../../widgets/queries/widget.query';

@injectable()
@mutation({
    name: 'createAlert',
    activity: CreateAlertActivity,
    invalidateCacheFor: [ DashboardQuery, WidgetQuery ],
    parameters: [
        { name: 'input', type: AlertInput }
    ],
    output: { type: AlertMutationResponse }
})
export class CreateAlertMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(ScheduleJobService.name)
        private _scheduleJobService: ScheduleJobService) {
        super();
    }

    async run(data: {input: IAlertInfo }): Promise<IMutationResponse> {
        return await this._scheduleJobService.addWidgetJob(data.input);

        // const that = this;

        // return new Promise<IMutationResponse>((resolve, reject) => {
        //     that._alert.model.createAlert(data.input)
        //         .then((response: IAlertDocument) => {
        //             resolve({ success: true, entity: response });
        //             return;
        //         }).catch(err => {
        //             reject({ success: false, errors: [{ field: 'alert', errors: err }] });
        //             return;
        //         });

        // });
    }
}