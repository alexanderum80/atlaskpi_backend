import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase } from '../kpi-base';
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
            value: { $sum: '$product.amount' }
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
        return this.executeQuery('product.from', dateRange, frequency);
    }

    getDataToSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
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
                        value: _.sumBy(v, 'value')
                    }))
                    .value()
                    .map(item => [item.category, item.value]);

        let result = [{
            name: 'Revenue',
            data: data
        }];
        return result;
    }

}