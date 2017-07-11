import { IChartFormatDetails, IChartFormatModel, IChartFormatDocument, IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';

export class RemoveChartFormatMutation implements IMutation<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _ChartFormatModel: IChartFormatModel) { }

    audit = true;

    run(data): Promise<IMutationResponse> {
        return this._ChartFormatModel.removeChartFormat(data.id);
    }
}
