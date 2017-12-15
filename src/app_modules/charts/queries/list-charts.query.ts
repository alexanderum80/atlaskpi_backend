import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { Winston } from 'winston';

import { IChart, IChartDocument } from '../../../domain/app/charts';
import { IQuery, query } from '../../../framework';
import { ListChartsActivity } from '../activities';
import { ChartsService } from './../../../services/charts.service';
import { ListChartsQueryResponse } from './../charts.types';

@injectable()
@query({
    name: 'listCharts',
    activity: ListChartsActivity,
    output: { type: ListChartsQueryResponse }
})
export class ListChartsQuery implements IQuery<IChart[]> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject('logger') private _logger: Winston
    ) { }

    run(data: { }): Promise<IChart[]> {
        const that = this;
        return new Promise<IChart[]>((resolve, reject) => {
            that._chartsService
                .listCharts()
                .then(charts => {
                    resolve(charts);
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    reject(err);
                });
        });
    }
}
