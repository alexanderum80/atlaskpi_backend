import * as Promise from 'bluebird';
import { ISaleModel } from '../../../models/app/sales';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase } from './kpi-base';
import { IAppModels } from '../../../models/app/app-models';
import { FrequencyEnum } from '../../../models/common/frequency-enum';
import { IDateRange } from '../../../models/common/date-range';

import * as _ from 'lodash';

export class Revenue extends KpiBase implements IKpiBase {

    constructor(sales: ISaleModel) {
        const baseAggregate: AggregateStage[] = [
            {
                filter: true,
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
                    // dynamic groupings are going to be added here
                    _id: { },
                    value: { $sum: '$product.paid' }
                }
            },
            {
                $sort: {
                    frequency: 1
                }
            }
        ];

        super(sales, baseAggregate);
    }

    getData(dateRange: IDateRange, options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('product.from', dateRange, options);
    }

    getTargetData(dateRange?: IDateRange, options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('product.from', dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

}