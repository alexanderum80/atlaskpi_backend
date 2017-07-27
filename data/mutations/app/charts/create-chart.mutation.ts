import { IChartModel } from '../../../models/app/charts';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';

export class CreateChartMutation implements IMutation<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _chartModel: IChartModel) { }

    audit = true;

    run(data): Promise<IMutationResponse> {
        return this._chartModel.createChart(data.input);
    }
}
