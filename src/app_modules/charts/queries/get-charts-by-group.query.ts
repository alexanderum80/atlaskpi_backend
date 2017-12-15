import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartDocument } from '../../../domain/app/charts/chart';
import { Charts } from '../../../domain/app/charts/chart.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetChartsByGroupActivity } from '../activities/get-charts-by-group.activity';
import { ListChartsQueryResponse } from '../charts.types';


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
    constructor(@inject('Charts') private _charts: Charts) { }

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
