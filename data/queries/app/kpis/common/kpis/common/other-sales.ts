import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match: {
                   $nor: [ { 'product.type' : { $regex: 'Retail', $options: 'i'} }, { 'product.type': { $regex: 'Service', $options: 'i' } } ]
                }
    },
    {
        frequency: true,
        $project: {
            'product': 1,
            '_id': 0
        }
    },
    {
        frequency: true,
        $group: {
            _id: null,
            revenue: { $sum: '$product.amount' }
        }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];

export class OtherSales extends KpiBase {
    constructor(sales: ISaleModel) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.executeQuery('product.from', dateRange, frequency);
    }
}