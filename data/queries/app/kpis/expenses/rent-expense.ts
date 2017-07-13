import { IExpense, IExpenseModel } from '../../../../models/app/expenses';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';
import * as _ from 'lodash';

const aggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match: { 'expense.concept': { $regex: 'Rent', $options: 'i'  } }
    },
    {
        frequency: true,
        $project: {
            'expense': 1,
            '_id': 0
        }
    },
    {
        frequency: true,
        $group: {
            _id: null,
            expenses: { $sum: '$expense.amount' }
        }
    },
    {
        $sort: {
            frequency: 1
        }
    }
];

export class RentExpenses extends KpiBase implements IKpiBase {

    constructor(expenses: IExpenseModel,
                private _preProcesingKpi = false) {
        super(expenses, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
       const that = this;

       return new Promise((resolve, reject) => {
            that.executeQuery('timestamp', dateRange, frequency).then(data => {
              if (that._preProcesingKpi) {
                  resolve(data);
              } else { resolve(that._toSeries(data)); }
            }), (e) => reject(e);
        });
    }

    private _toSeries(rawData: any[]) {
        let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
        let years = _.uniq(frequencies.map(f => { return f.split('-')[0]; }));

        let result = [];

        years.forEach(y => {
            let serie = { name: y,
                          data: this._byYear(rawData, y) };
            result.push(serie);
        });

        return result;
    }

    private _byYear(rawData: any, year: string) {
        let data = rawData.filter(d => {
            if (d._id.frequency.indexOf(year) === -1) { return; };
            return d;
        });

        data = _.sortBy(data, '_id.frequency');
        return data.map(item => [ item._id.frequency, item.expenses ]);
    }

}