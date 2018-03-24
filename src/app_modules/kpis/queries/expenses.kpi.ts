import * as Promise from 'bluebird';

import { IExpenseModel } from '../../../domain/app/expenses/expense';
import { IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase } from './kpi-base';


export class Expenses extends KpiBase implements IKpiBase {

    constructor(expense: IExpenseModel) {
        const baseAggregate: AggregateStage[] = [
            {
                filter: true,
                $match: { }
            },
            {
                frequency: true,
                $project: {
                    'expense': 1,
                    '_id': 0,
                    timestamp: 1
                }
            },
            {
                frequency: true,
                $group: {
                    _id: { },
                    value: { $sum: '$expense.amount' }
                }
            },
            {
                topN: true,
                $sort: {
                    '_id.frequency': 1
                }
            }
        ];

        super(expense, baseAggregate);
    }

    getData(dateRange: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getTargetData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

}