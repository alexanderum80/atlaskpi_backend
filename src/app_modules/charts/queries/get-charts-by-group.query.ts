import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Charts, IChartDocument } from '../../../domain';
import { ListChartsQueryResponse } from '../charts.types';
import { GetChartsByGroupActivity } from '../activities';

@injectable()
@query({
    name: 'getChartsByGroup',
    activity: GetChartsByGroupActivity,
    parameters: [
        { name: 'group', type: String },
    ],
    output: { type: ListChartsQueryResponse }
})
export class GetChartsByGroupQuery implements IQuery<IChartDocument[]> {
    constructor(@inject('Charts') private _charts: Charts) {
        
    }

    run(data: { group: String,  }): Promise<IChartDocument[]> {
        const that = this;

        return new Promise<IChartDocument[]>((resolve, reject) => {
            this._charts.model.find({ group: data.group })
            .then(charts => {
                resolve(charts);
            })
            .catch(err => {
                reject('There was an error retrieving chart');
            });
        });
    }
}
