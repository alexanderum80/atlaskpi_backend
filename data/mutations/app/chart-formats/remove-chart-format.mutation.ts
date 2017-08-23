import { MutationBase } from '../../mutation-base';
import { IChartFormatDetails, IChartFormatModel, IChartFormatDocument, IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import { AccountCreatedNotification } from '../../../../services';

export class RemoveChartFormatMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _ChartFormatModel: IChartFormatModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        return this._ChartFormatModel.removeChartFormat(data.id);
    }
}
