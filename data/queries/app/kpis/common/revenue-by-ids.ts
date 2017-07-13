import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase} from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match:  { }
    },
    {
        frequency: true,
        $project: { _id: 0, product: 1 }
    },
    {
        frequency: true,
        $group: { revenue: { $sum: '$product.amount' } }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];

export interface IRevenueByIdKpi extends IKpiBase {
    setExternalids(ids: any[]): void;
}

export class RevenueByIds extends KpiBase implements IKpiBase {

    externalIds: string[];

    constructor(sales: ISaleModel) {
        super(sales, aggregate);
    }

    setExternalids(ids: any[]) {
        this.externalIds = ids;
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        // inject a criteria to the $match stage
        if (this.externalIds) {
            let query = this.findStage('dateRange', '$match').$match;
            query['employee.externalId'] = { '$in': this.externalIds };
        };

        return this.executeQuery('product.from', dateRange, frequency);
    }

}
