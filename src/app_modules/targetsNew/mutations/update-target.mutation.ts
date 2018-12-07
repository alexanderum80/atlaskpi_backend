import { inject, injectable } from 'inversify';

import { ITargetNewInput } from '../../../domain/app/targetsNew/target';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateTargetNewActivity } from '../activities/update-target.activity';
import { TargetNewInput, UpdateTargetNewResponse } from '../target.types';
import { Charts } from '../../../domain/app/charts/chart.model';
import { IChart } from '../../../domain/app/charts/chart';
import { CurrentUser } from '../../../domain/app/current-user';

@injectable()
@mutation({
    name: 'updateTargetNew',
    activity: UpdateTargetNewActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'TargetInput', type: TargetNewInput, required: true }
    ],
    output: { type: UpdateTargetNewResponse }
})
export class UpdateTargetNewMutation extends MutationBase<IMutationResponse> {
    constructor(
        @inject(TargetsNew.name) private _targets: TargetsNew,
        @inject(Charts.name) private _charts: Charts,
        @inject(CurrentUser.name) private _user: CurrentUser,
    ) {
        super();
    }

    async run(data: { _id: string, TargetInput: ITargetNewInput }): Promise<IMutationResponse> {
        const i = data.TargetInput;
        const chart = await this._charts.model.findById(data.TargetInput.source.identifier).lean().exec() as IChart;

        i.reportOptions = {
            kpi: chart.kpis[0] as any,
            dateRange: chart.dateRange[0],
            frequency: chart.frequency,
            groupings: chart.groupings,
            timezone: this._user.get().profile.timezone,
            categorySource: chart.xAxisSource,
        };

        const target = await this._targets.model.updateTargetNew(data._id, data.TargetInput as any);

        return {
            success: true,
            entity: target
        };
    }
}
