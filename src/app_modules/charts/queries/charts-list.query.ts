import { IChartDocument } from '../../../domain/app/charts';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Charts } from '../../../domain';
import { ListChartsActivity } from '../activities';

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
    constructor(@inject('Charts') private _charts: Charts) {
        
    }

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
