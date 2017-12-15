import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChart } from '../../../domain/app/charts/chart';
import { Logger } from '../../../domain/app/logger';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ChartsService } from './../../../services/charts.service';
import { ListChartsActivity } from './../activities/list-charts.activity';
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
        @inject('Logger') private _logger: Logger
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
