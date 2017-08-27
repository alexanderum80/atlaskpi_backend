import { QueryBase } from '../../query-base';
import { IChartFormat, IChartFormatModel, IChartFormatDocument } from '../../../models/app/chart-formats';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult, IQueryResponse } from '../../../';

export class GetChartFormatByIdQuery extends QueryBase<IQueryResponse<IChartFormatDocument>> {

    constructor(
        public identity: IIdentity,
        private _ChartFormatModel: IChartFormatModel) {
            super(identity);
        }

    // log = true;
    // audit = true;

    run(data: string): Promise<IQueryResponse<IChartFormatDocument>> {
        return this._ChartFormatModel.getChartFormatById(data);
    }
}