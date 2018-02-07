import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ListRunRateActivity } from '../activities/list-run-rate.activity';
import { IChartRunRateDocument } from '../../../domain/app/run-rate/run-rate';
import { ChartRunRates } from '../../../domain/app/run-rate/run-rate.model';
import { ChartRunRate } from '../run-rate.types';

@injectable()
@query({
    name: 'chartRunRate',
    activity: ListRunRateActivity,
    output: { type: ChartRunRate , isArray: true }
})
export class ListChartsRunRateQuery implements IQuery<IChartRunRateDocument[]> {

    constructor(@inject(ChartRunRates.name) private _runRate: ChartRunRates ) { }

    run(): Promise<IChartRunRateDocument[]> {
        const that = this;

        return new Promise<IChartRunRateDocument[]>((resolve, reject) => {
            that._runRate.model
            .find()
            .then(runRateDocuments => {
                return resolve(runRateDocuments);
            })
            .catch(err => {
                return reject(err);
            });
        });
    }
}
