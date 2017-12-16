import { ChartQuery } from './chart.query';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Charts } from '../../../domain/app/charts/chart.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListChartsActivity } from '../activities/list-charts.activity';



@injectable()
@query({
    name: 'charts',
    activity: ListChartsActivity,
    parameters: [
        { name: 'from', type: String, required: true },
        { name: 'to', type: String, required: true },
        { name: 'preview', type: Boolean },
    ],
    output: { type: String }
})
export class ChartsQuery implements IQuery<string> {
    constructor(@inject(Charts.name) private _charts: Charts) {
                @inject('KPIs') private _kpis: Charts) {
    }

    run(data: { from: string, to: string, preview: boolean }): Promise<string> {
        const that = this;

        return new Promise<string>((resolve, reject) => {
            that._charts.model
            .find({})
            .populate({
                path: 'kpis'
            })
            .then(chartsCollection => {
                // process charts
                let promises = chartsCollection.map(c => {
                    // TODO: Refactoring needed here
                    // const chartQuery = new ChartQuery();
                    // return chartQuery.run({ id: c._id });
                });

                Promise.all(promises).then((charts) => {
                let response = {};
                Object.assign(response, { charts: charts });
                resolve(<any>JSON.stringify(response));
                }).catch(e => reject(e));
            });

        });
    }
}
