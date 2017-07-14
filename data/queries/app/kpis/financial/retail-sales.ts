import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase, IKPIResult, IKPIMetadata } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match: { 'category.service': { '$ne': 1 } }
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
            value: { $sum: '$product.amount' }
        }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];

export class RetailSales extends KpiBase implements IKpiBase {

    constructor(sales: ISaleModel) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum, grouping?: string): Promise<IKPIResult> {
        let that = this;

        return this.executeQuery('product.from', dateRange, frequency, grouping).then(data => {
            return Promise.resolve({ data: data, metadata: { name: 'Retail Sales', dateRange: dateRange, frequency: frequency }});
        })
        .catch((err) => {
            return Promise.reject(err);
        });
    }
}