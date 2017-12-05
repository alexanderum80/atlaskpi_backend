
import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Charts } from '../../../domain';
import { ListChartsActivity } from '../activities';

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
export class ChartsQuery extends QueryBase<String> {
    constructor(@inject('Charts') private _charts: Charts) {
        super();
    }

    run(data: { from: String, to: String, preview: Boolean,  }): Promise<String> {
        const that = this;

        return new Promise<String>((resolve, reject) => {
            that._charts.model
            .find({})
            .populate({
                path: 'kpis'
            })
            .then(chartsCollection => {
                // process charts
                let promises = chartsCollection.map(c => {
                    // TODO: Refactoring needed here
                    let chartQuery = new GetChartQuery(that.identity, that._ctx);
                    return chartQuery.run({ id: c._id });
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
