import { IExpenseModel } from '../../../../models/app/expenses';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as _ from 'lodash';
import * as moment from 'moment';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match: {
            'expense.concept': 'Payroll'
        }
    },
    {
        frequency: true,
        $project: {_id: 0, expense: 1}
    },
    {
        frequency: true,
        $group: {
            _id: null,
            total: {
                $sum: '$expense.amount'
            }
        }
    },
    {
        $sort: {
            '_id.frequency': 1
        }
    }
];

export class TotalPayroll extends KpiBase implements IKpiBase {
    constructor(sales: IExpenseModel) {
        super(sales, aggregate);
    }

    getRawData(dateRange: IDateRange, frequency: FrequencyEnum) {
        return this.executeQuery('timestamp', dateRange, frequency);
    }

    getData(dateRange: IDateRange, frequency: FrequencyEnum): Promise<any> {
        const that = this;
        return this.executeQuery('timestamp', dateRange, frequency).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        })
    }

    private _toSeries(rawData: any[], frequency: FrequencyEnum) {
        return _(rawData)
            .sortBy('_id.frequency')
            .groupBy((freq) => {
                return moment(freq._id.frequency, "YYYY/MM").format("YYYY")
            })
            .map((v, k) => ({
                name: k,
                data: v.map(item => [item._id.frequency, item.total])
            }))
            .value();
    }

}