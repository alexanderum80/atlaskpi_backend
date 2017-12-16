import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartDocument } from '../../../domain/app/charts/chart';
import { Charts } from '../../../domain/app/charts/chart.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListChartsActivity } from '../activities/list-charts.activity';


@injectable()
@query({
    name: 'chartsList',
    activity: ListChartsActivity,
    parameters: [
        { name: 'preview', type: Boolean },
    ],
    output: { type: String }
})
export class ChartsListQuery implements IQuery<IChartDocument[]> {
    constructor(@inject(Charts.name) private _charts: Charts) { }

    run(data: { preview: Boolean,  }): Promise<IChartDocument[]> {
        const that = this;

        return new Promise<IChartDocument[]>((resolve, reject) => {
            that._charts.model
            .find()
            .then(chartDocuments => {
                return resolve(chartDocuments);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }
}
