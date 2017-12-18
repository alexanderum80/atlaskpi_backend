import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IChartDocument } from '../../../domain/app/charts/chart';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ChartsService } from '../../../services/charts.service';
import { ListChartsActivity } from '../activities/list-charts.activity';
import { IChart } from './../../../domain/app/charts/chart';
import { Logger } from './../../../domain/app/logger';


@injectable()
@query({
    name: 'chartsList',
    activity: ListChartsActivity,
    parameters: [
        { name: 'preview', type: Boolean },
    ],
    output: { type: String }
})
export class ChartsListQuery implements IQuery<IChart[]> {
    constructor(
        @inject(ChartsService.name) private _chartsService: ChartsService,
        @inject(Logger.name) private _logger: Logger
    ) { }

    run(data: { preview: Boolean,  }): Promise<IChart[]> {
        const that = this;

        return new Promise<IChart[]>((resolve, reject) => {
           that ._chartsService
                .getChartsWithoutDefinition()
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
