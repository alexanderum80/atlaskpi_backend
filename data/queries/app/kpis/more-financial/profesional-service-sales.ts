import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match: { 'category.service': { '$eq': 1 } }
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

export class ProfesionalServiceSales extends KpiBase {
    constructor(sales: ISaleModel,
                private _preProcesingKpi = false) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.executeQuery('product.from', dateRange, frequency).then(data => data);
    }

    getDataToSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

            return new Promise((resolve, reject) => {
            that.executeQuery('product.from', dateRange, frequency).then(data => {
               if (that._preProcesingKpi) {
                  resolve(data);
               } else {
                   resolve(that._toSeries(data));
                }
            }), (e) => reject(e);
        });
    }

    private _toSeries(rawData: any[]) {
        return [{
            name: 'Profesional Service Sales',
            data: rawData.map(item => [ item._id.frequency, item.value ])
        }];
    }
}