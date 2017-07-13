import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

import * as _ from 'lodash';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match: { }
    },
    {
        frequency: true,
        $project: {
            'product': 1,
            'category': 1,
            '_id': 0
        }
    },
    {
        frequency: true,
        $group: {
            _id: { category: '$category.name' },
            sales: { $sum: '$product.amount' }
        }
    },
    {
        $sort: {
            frequency: 1
        }
    }
];

export class RevenueByServiceLine extends KpiBase {

    constructor(sales: ISaleModel) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        return new Promise<any>((resolve, reject) => {
            that.executeQuery('product.from', dateRange, frequency).then(data => {
                resolve(that._toSeries(data));
            }, (e) => reject(e));
        });
    }

    private _toSeries(rawData: any[]) {
        let data = _(rawData)
                    .groupBy('_id.category')
                    .map((v, k) => ({
                        category: k,
                        sales: _.sumBy(v, 'sales')
                    }))
                    .value()
                    .map(item => [item.category, item.sales]);

        let result = [{
            name: 'Revenue',
            data: data
        }];
        return result;
    }

}