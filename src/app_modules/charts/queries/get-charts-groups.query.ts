import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

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
export class GetChartsGroupQuery implements IQuery<string[]> {
    constructor(@inject(Charts.name) private _charts: Charts) { }

    run(data: { group: string,  }): Promise<string[]> {
        const that = this;

        return new Promise<string[]>((resolve, reject) => {
            this._charts.model.find({}).then(charts => {
                // let result: string[] = [];
                let groups: string[] = [];

                let uniqGroup: string[] = [];

                charts.forEach(collection => {
                    let group = collection.group;
                    if (group && uniqGroup.indexOf(group) === -1) {
                        uniqGroup.push(group);
                    }
                });

                resolve(<any>JSON.stringify(uniqGroup));
            })
            .catch(err => {
                reject('There was an error retrieving chart');
            });
        });
    }
}
