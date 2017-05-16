import { IChartFormat, IChartFormatModel } from '../../../models/app/chart-formats';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class GetAllChartFormatsQuery implements IQuery<IPagedQueryResult<IChartFormat>> {

    constructor(
        public identity: IIdentity,
        private _ChartFormatModel: IChartFormatModel) { }

    // log = true;
    // audit = true;

    run(data: IPaginationDetails): Promise<IPagedQueryResult<IChartFormat>> {
        return this._ChartFormatModel.getAllChartFormats(data);
    }
}