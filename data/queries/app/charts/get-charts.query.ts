import { ChartCollection } from './chart-collection';
import { IAppModels } from '../../../models/app/app-models';
// import { ChartProcessor } from './chart-processor';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class GetChartsQuery implements IQuery<string> {

    constructor(
        public identity: IIdentity,
        private _ctx: IAppModels) { }

    run(data: { from: Date, to: Date, preview: boolean }): Promise<string> {
        let processor = new ChartCollection(this._ctx);
        return processor.getCharts(data);
    }
}

