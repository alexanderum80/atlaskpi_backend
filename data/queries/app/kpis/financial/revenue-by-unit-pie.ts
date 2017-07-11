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
            sales: {
                $sum: "$product.amount"
            }
        }
    }
];

export class RevenueByUnitPie extends KpiBase{
    constructor(sales: ISaleModel) {
        super(sales, aggregate);
    }
    
    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return this.executeQuery('timestamp', dateRange, frequency).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        })
    } 
    _toSeries(rawData: any[], frequency: FrequencyEnum) {
        return [{
            name: "Revenue",
            data: this.arrangeData(rawData)

        }]
    }
    private arrangeData(rawData: any) {
        return _(rawData)
            .orderBy("sales", "desc")
            .groupBy("_id.location")
            .map((v, k) => ({
                product: k,
                sales: _.sumBy(v, 'sales')
            }))
            .map(item => [item.product, item.sales])
            .value();
    }

}