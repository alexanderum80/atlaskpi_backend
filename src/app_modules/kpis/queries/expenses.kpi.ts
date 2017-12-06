import { FrequencyEnum, IDateRange } from '../../../domain/common';
import { IExpenseModel, IKPIDocument } from '../../../domain';
import * as Promise from 'bluebird';
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
                    '_id.frequency': 1
                }
            }
        ];

        super(expense, baseAggregate);
    }

    getData(kpi: IKPIDocument, dateRange: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getTargetData(IKPIDocument, dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

}