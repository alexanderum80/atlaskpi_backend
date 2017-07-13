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
        $match: { $or: [ { 'category.name' : { $regex: 'Consulting', $options: 'i'} }, { 'category.name': { $regex: 'Research', $options: 'i' } } ]}
    },
    {
        frequency: true,
        $project: { product: 1 }
    },
    {
        frequency: true,
        $group: {  _id: null, 'revenue': { $sum: '$product.amount' } }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];

export class ConsultingResearchSales extends KpiBase {

    constructor(sales: ISaleModel,
                private _preProcesingKpi = false) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        return new Promise((resolve, reject) => {
            that.executeQuery('product.from', dateRange, frequency).then(data => {
              if (that._preProcesingKpi) {
                  resolve(data);
              } else { resolve(that._toSeries(data)); }
            }), (e) => reject(e);
        });
    }

    private _toSeries(rawData: any[]) {
        return [{
            name: 'Consulting Research Sales',
            data: rawData.map(item => [ item._id.frequency, item.revenue ])
        }];
    }
}

