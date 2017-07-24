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

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.executeQuery('product.from', dateRange, frequency);
    }

    getSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        return this.getData(dateRange, frequency).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        });
    }

    private _toSeries(rawData: any[], frequency: FrequencyEnum) {

        if (!frequency) {
            return [{
                name: 'Retail',
                data: rawData.map(item => [ null, item.sales ])
            }];
        } else {
           let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
           let years = _.uniq(frequencies.map(f => { return f.split('-')[0]; }));

            let result = [];

            years.forEach(y => {
                let serie = { name: y,
                            data: this._getRetalByYear(rawData, y) };
                result.push(serie);
            });

            return result;
        }
    }

    private _getRetalByYear(rawData: any, year: string) {
        let data = rawData.filter(d => {
            if (d._id.frequency.indexOf(year) === -1) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ item._id.frequency, item.value ]);
    }




}