import { inject, injectable } from 'inversify';

import { IChart } from '../../../domain/app/charts/chart';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Logger } from './../../../domain/app/logger';
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
        @inject(Logger.name) private _logger: Logger
    ) { }

    run(data: { }): Promise<IChart[]> {
        return this._chartsService.listCharts();
    }
}
