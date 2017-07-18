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
        $match: {}
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
            _id: { product: '$product.itemDescription' },
            value: { $sum: '$product.amount' }
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
        return this.executeQuery('product.from', dateRange, frequency).then(data => data);
    }
    
    getSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        return this.executeQuery('product.from', dateRange, frequency).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        });        
    }

     private _toSeries(rawData: any[], frequency: FrequencyEnum) {
        if (!frequency) {
            let getBottomRank = [];
            let data = _.orderBy(rawData, ['value'], ['desc'])
                      .filter((item, index) => {
                          if (index > 9) {
                              getBottomRank.push(item);
                              return ;
                          }
                          return item;
                      });

            let noFreqTenData = this._afterTen(getBottomRank);

            let noFreqAllData = [data, noFreqTenData];
            noFreqAllData = _.flatten(noFreqAllData);

            return [{
                name: 'Sales',
                data: noFreqAllData.filter((item, index) => {
                            return item;
                        })
                        .map(item => [ item['_id']['product'], item['value'] ])
            }];

        } else {
            let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
            let products =  this._topTenBestSeller(rawData);

            let bottomSales = [];

            let data = rawData.filter((item, index) => {
                           if (frequencies.indexOf(item._id.frequency) === -1 ||
                               products.indexOf(item._id.product) === -1)  { bottomSales.push(item); return; };
                           return item;
                       });

            let notTopTen = this._afterTen(bottomSales);

            let allData = [data, notTopTen];
            allData = _.flatten(allData);

            allData = _.orderBy(allData, ['_id.frequency', 'value'], ['asc', 'desc']);
            let groupData = _(allData)
                    .groupBy('_id.product')
                    .map((v, k) => ({
                        name: k,
                        data: v.map(item => [item._id.frequency, item.value])
                    }))
                    .value();

            return groupData;
        }
    }

    private _topTenBestSeller(rawData: any) {
        return  _(rawData)
                .groupBy('_id.product')
                .map((v, k) => ({
                    product: k,
                    value: _.sumBy(v, 'value')
                }))
                .orderBy('value', 'desc')
                .filter((item, index) => {
                    if (index > 9) { return; };
                    return item;
                })
                .map(item => item.product);
    }

    private _afterTen(rawData: any) {
        let data = _.orderBy(rawData, "value", "desc");
        let sum = 0;
        
        let others = _(data)
            .groupBy("_id.frequency")
            .map((v, k) => ({
                _id: {
                    product: "Others",
                    frequency: k
                },
                value: _.sumBy(v, 'value')
            }))
            .orderBy('_id.frequency','desc')
            .value();
            
        return others;
    }

}