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
            '_id': 0
        }
    },
    {
        frequency: true,
        $group: {
            _id: { product: '$product.name' },
            sales: { $sum: '$product.price' }
        }
    },
    {
        $sort: {
            frequency: 1
        }
    }
];

export class SalesByProduct extends KpiBase {

    constructor(sales: ISaleModel) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        return this.executeQuery('product.from', dateRange, frequency).then(data => {
            // console.log(JSON.stringify(that._toSeries(data, frequency)));
            return Promise.resolve(that._toSeries(data, frequency));
        });
    }

     private _toSeries(rawData: any[], frequency: FrequencyEnum) {
        // console.log(JSON.stringify(rawData));
        if (!frequency) {
            return [{
                name: 'Sales',
                data: _.orderBy(rawData, ['sales'], ['desc'])
                       .filter((item, index) => {
                           if (index > 9) { return; };
                           return item;
                       })
                       .map(item => [ item._id.product, item.sales ])
            }];

        } else {
            let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
            let products =  this._topTenBestSeller(rawData);

            let data = rawData.filter((item, index) => {
                           if (frequencies.indexOf(item._id.frequency) === -1 ||
                               products.indexOf(item._id.product) === -1)  { return; };
                           return item;
                       });

            data = _.orderBy(data, ['_id.frequency', 'sales'], ['asc', 'desc']);
            data = _(data)
                    .groupBy('_id.product')
                    .map((v, k) => ({
                        name: k,
                        data: v.map(item => [item._id.frequency, item.sales])
                    }))
                    .value();

            return data;
        }
    }

    private _topTenBestSeller(rawData: any) {
        return  _(rawData)
                .groupBy('_id.product')
                .map((v, k) => ({
                    product: k,
                    sales: _.sumBy(v, 'sales')
                }))
                .orderBy('sales', 'desc')
                .filter((item, index) => {
                    if (index > 9) { return; };
                    return item;
                })
                .map(item => item.product);
    }

}