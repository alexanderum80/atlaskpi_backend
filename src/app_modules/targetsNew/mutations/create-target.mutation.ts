import { inject, injectable } from 'inversify';

import { ITargetNewInput } from '../../../domain/app/targetsNew/target';
import { TargetsNew } from '../../../domain/app/targetsNew/target.model';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateTargetNewActivity } from '../activities/create-target.activity';
import { CreateTargetNewResponse, TargetNewInput } from '../target.types';
import { Charts } from '../../../domain/app/charts/chart.model';
import { CurrentUser } from '../../../domain/app/current-user';
import { IChart } from '../../../domain/app/charts/chart';


@injectable()
@mutation({
    name: 'createTargetNew',
    activity: CreateTargetNewActivity,
    parameters: [
        { name: 'TargetInput', type: TargetNewInput },
    ],
    output: { type: CreateTargetNewResponse }
})
export class CreateTargetNewMutation extends MutationBase<IMutationResponse> {

    constructor(
        @inject(TargetsNew.name) private _targets: TargetsNew,
        @inject(Charts.name) private charts: Charts,
        @inject(CurrentUser.name) private user: CurrentUser,
    ) {
        super();
    }

    async run(data: { TargetInput: ITargetNewInput }): Promise<IMutationResponse> {
        try {
            const input = data.TargetInput;
            const chart = await this.charts.model.findById(data.TargetInput.source.identifier).lean().exec() as IChart;
            input.reportOptions = {
                kpi: chart.kpis[0] as any,
                dateRange: chart.dateRange[0],
                frequency: chart.frequency,
                groupings: chart.groupings,
                timezone: this.user.get().profile.timezone,
            };

            const target = await this._targets.model.createNew(input);
            return { success: true, entity: target };
        } catch (e) {
            return {
                success: false,
                errors: [
                    {
                        field: 'general',
                        errors: ['There was an error creating the target']
                    }
                ]
            };
        }
    }
}
