import { QueryBase } from '../../query-base';
import { GetChartQuery } from './get-chart.query';
import { IAppModels } from '../../../models/app/app-models';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import { IChartDocument } from '../../../models/app/charts';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel } from '../../../';


export class ListChartsQuery extends QueryBase<IChartDocument[]> {

    constructor(
        public identity: IIdentity,
        private _ctx: IAppModels) {
            super(identity);
        }

    run(data: any): Promise<IChartDocument[]> {
        const that = this;

        return new Promise<IChartDocument[]>((resolve, reject) => {
            that._ctx.Chart
            .find()
            .then(chartDocuments => resolve(chartDocuments))
            .catch(err => reject(err));
        });
    }
}

