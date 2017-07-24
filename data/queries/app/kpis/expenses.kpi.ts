import { IExpenseModel } from '../../../models/app/expenses';
import * as Promise from 'bluebird';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase } from './kpi-base';
import { FrequencyEnum } from '../../../models/common/frequency-enum';
import { IDateRange } from '../../../models/common/date-range';

import * as _ from 'lodash';

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
                    '_id': 0
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
                $sort: {
                    frequency: 1
                }
            }
        ];

        super(expense, baseAggregate);
    }

    getData(dateRange: IDateRange, options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

}