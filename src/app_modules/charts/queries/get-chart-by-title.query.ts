import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartDocument, IChart } from '../../../domain/app/charts/chart';
import { Charts } from '../../../domain/app/charts/chart.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ChartEntityResponse } from '../charts.types';
import { GetChartByTitleActivity } from '../activities/get-chart-by-title.activity';
import { ChartsService } from '../../../services/charts.service';
import { Logger } from '../../../domain/app/logger';


@injectable()
@query({
    name: 'getChartByTitle',
    activity: GetChartByTitleActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'title', type: String, required: true },
    ],
    output: { type: ChartEntityResponse }
})
export class GetChartByTitleQuery implements IQuery<IChart> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    run(data: { _id: string, title: string }): Promise<IChart> {
        const that = this;
        return new Promise<IChart>((resolve, reject) => {
            that._chartsService
                .getChartByName(data._id, data.title)
                .then(chart => {
                    resolve(chart);
                    return;
                })
                .catch(err => {
                    that._logger.error(err);
                    reject(err);
                });
        });
    }
}
