import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase} from '../kpi-base';
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
            _id: 0,
            location: 1,
            product: 1
        }
    },
    {
        frequency: true,
        $group: {
            _id: {
                location: "$location.name"
            },
            value: {
                $sum: "$product.amount"
            }
        }
    }
];

export class RevenueByUnits extends KpiBase {
    constructor(sales: ISaleModel) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.executeQuery('product.from', dateRange, frequency);
    }

    getDataToSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return this.getData(dateRange, frequency).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        })
    }

    private _toSeries(rawData: any[], frequency: FrequencyEnum) {
        let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
        let products =  this.arrangeData(rawData);
        let data = rawData.filter((item, index) => {
                if (frequencies.indexOf(item._id.frequency) === -1 ||
                    products.indexOf(item._id.location) === -1)  { return; };
                return item;
            });
            
        let groupData = _(data)
                .orderBy('_id.frequency', 'asc')
                .groupBy('_id.location')
                .map((v, k) => ({
                    name: k,
                    data: v.map(item => [item._id.frequency, item.value])
                }))
                .value();

        return groupData;
    }
    
    private arrangeData(rawData: any) {
        return _(rawData)
            .orderBy("value", "desc")
            .groupBy("_id.location")
            .map((v, k) => ({
                product: k,
                value: _.sumBy(v, 'value')
            }))
            .map(item => item.product)
            .value();
    }
}