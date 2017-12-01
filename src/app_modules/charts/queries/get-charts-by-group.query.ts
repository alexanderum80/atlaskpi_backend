import { QueryBase } from '../../query-base';
import { IAppModels } from '../../../models/app/app-models';
import { IIdentity } from '../../../models/app/identity';
import { IChartModel, IChartDocument } from '../../../models/app/charts';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
// import { ChartProcessor } from './chart-processor';


export class GetChartsByGroupQuery extends QueryBase<IChartDocument[]> {
        constructor(
            public identity: IIdentity,
            private _ctx: IAppModels) {
                super(identity);
            }
        run(data: any): Promise<IChartDocument[]> {
            const that = this;

            return new Promise<IChartDocument[]>((resolve, reject) => {
                this._ctx.Chart.find({ group: data.group })
                .then(charts => {
                    resolve(charts);
                })
                .catch(err => {
                    reject('There was an error retrieving chart');
                });
            });
        }
    }