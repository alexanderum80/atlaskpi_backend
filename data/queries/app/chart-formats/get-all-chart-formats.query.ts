import { QueryBase } from '../..';
import { IChartFormat, IChartFormatModel } from '../../../models/app/chart-formats';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class GetAllChartFormatsQuery extends QueryBase<IPagedQueryResult<IChartFormat>> {

    constructor(
        public identity: IIdentity,
        private _ChartFormatModel: IChartFormatModel) {
            super(identity);
        }

    // log = true;
    // audit = true;

    run(data: IPaginationDetails): Promise<IPagedQueryResult<IChartFormat>> {
        return this._ChartFormatModel.getAllChartFormats(data);
    }
}