import { IExpenseModel } from '../../../domain/app/expenses/expense';
import { IDateRange } from '../../../domain/common/date-range';
import { FrequencyEnum } from '../../../domain/common/frequency-enum';
import { AggregateStage } from './aggregate';
import { IGetDataOptions, IKpiBase, KpiBase } from './kpi-base';
import {IVirtualSourceDocument} from '../../../domain/app/virtual-sources/virtual-source';
import { isEmpty } from 'lodash';
import {KPIFilterHelper} from '../../../domain/app/kpis/kpi-filter.helper';

const VIRTUAL_SOURCE_EXPENSES = 'Expenses';

export class Expenses extends KpiBase implements IKpiBase {

    constructor(expense: IExpenseModel, virtualSources: IVirtualSourceDocument[]) {
        let vsAggregate: any[] = [];

        // expense virtual source has virtual fields called mainConcept
        if (Array.isArray(virtualSources) && !isEmpty(virtualSources)) {
            const virtualSource = virtualSources.find((s: IVirtualSourceDocument) => s.name === VIRTUAL_SOURCE_EXPENSES);

            if (virtualSource && !isEmpty(virtualSource.aggregate)) {
                vsAggregate = virtualSource.aggregate.map(a => {
                    return KPIFilterHelper.CleanObjectKeys(a);
                });
            }
        }

        let baseAggregate: AggregateStage[] = [
            {
                filter: true,
                $match: { }
            },
            {
                frequency: true,
                $project: {
                    'expense': 1,
                    '_id': 0,
                    timestamp: 1
                }
            },
            {
                frequency: true,
                $group: {
                    _id: { },
                    value: { $sum: '$expense.amount' }
                }
            },
            {
                topN: true,
                $sort: {
                    '_id.frequency': 1
                }
            }
        ];

        if (Array.isArray(vsAggregate) && !isEmpty(vsAggregate)) {
            vsAggregate = vsAggregate.concat(baseAggregate);
        } else {
            vsAggregate = baseAggregate;
        }

        super(expense, vsAggregate, null);
    }

    getData(dateRange: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getTargetData(dateRange?: IDateRange[], options?: IGetDataOptions): Promise<any> {
        return this.executeQuery('timestamp', dateRange, options);
    }

    getSeries(dateRange: IDateRange, frequency: FrequencyEnum) {}

}