import { IChartModel, IChartInput } from '../../../models/app/charts';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';

interface IUpdateChartMutation {
    id: string;
    input: IChartInput;
}

export class UpdateChartMutation implements IMutation<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _chartModel: IChartModel) { }

    audit = true;

    run(data: IUpdateChartMutation): Promise<IMutationResponse> {
        return this._chartModel.updateChart(data.id, data.input);
    }
}
