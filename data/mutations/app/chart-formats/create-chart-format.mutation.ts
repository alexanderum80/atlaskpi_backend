import { MutationBase } from '../../mutation-base';
import { IChartFormatDetails, IChartFormatModel, IChartFormatDocument, IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import { IKPIModel } from '../../../models/app/kpis';
import { IDashboardDocument, IDashboardModel } from '../../../models/app/dashboards';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class CreateChartFormatMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _ChartFormatModel: IChartFormatModel
        ) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        return this._ChartFormatModel.createChartFormat(data);
    }
}
