import { QueryBase } from '../../query-base';
import { IAppModels } from '../../../models/app/app-models';
// import { ChartProcessor } from './chart-processor';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class GetChartDefinitionQuery extends QueryBase<string> {

    constructor(
        public identity: IIdentity,
        private _ctx: IAppModels) {
            super(identity);
        }

    run(data: { id: string, from: Date, to: Date }): Promise<string> {
        return;
    }
}

