import { IChartFormatDetails, IChartFormatModel, IChartFormatDocument, IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';
import { IAppConfig } from '../../../../config';

export class UpdateChartFormatMutation implements IMutation<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _ChartFormatModel: IChartFormatModel) { }

    audit = true;

    run(data): Promise<IMutationResponse> {
        return this._ChartFormatModel.updateChartFormat(data.id, data.data);
    }
}
