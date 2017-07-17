import { IExpenseModel } from '../../../../models/app/expenses';
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
        $match:  { }
    },
    {
        $project: { _id: 0, expense: 1, concept: 1 }
    },
    {
        $group: {
            _id: { concept: '$expense.concept' },
            value: { $sum: '$expense.amount' }
        }
    },
    {
        $sort: {
            value: -1
        }
    }
];

export class ExpenseByCategory extends KpiBase {

   constructor(sales: IExpenseModel) {
        super(sales, aggregate);
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.executeQuery('timestamp', dateRange);
    }

    getDataToSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return this.getData(dateRange).then(data => {
            return Promise.resolve(that._toSeries(data, frequency));
        })
    }

    private _toSeries(rawData: any[], frequency: FrequencyEnum) {
        if (!frequency) {
            let bottomSales = [];
            let data = _.orderBy(rawData, "value", "desc")
                .filter((item, index) => {
                    if (index > 5) {
                        bottomSales.push(item);
                        return ;
                    }
                    return item;
                });

            let notTopFive = this._afterFiveBest(bottomSales);

            let noFreqAllData = [data, notTopFive];
            noFreqAllData = _.flatten(noFreqAllData);
            
            return [{
                name: "Expenses",
                data: noFreqAllData.filter((item, index) => {
                    return item;
                })
                .map(item => [item['_id']['concept'], item['value']])
            }]
        }
        else {
            let frequencies = _.uniq(rawData.map(item => item._id.frequency)).sort();
            let concept =  this._topFivBestSeller(rawData);

            let hasFrequencyBottomExpenses = [];
            
            let data = rawData.filter((item, index) => {
                        if (frequencies.indexOf(item._id.frequency) === -1 ||
                            concept.indexOf(item._id.concept) === -1)  { hasFrequencyBottomExpenses.push(item); return; };
                        return item;
                    });

            let afterFive = this._afterFiveBest(hasFrequencyBottomExpenses);
            let completeData = [data, afterFive];

            completeData = _.flatten(completeData);
            completeData = _.orderBy(completeData, ["_id.frequency", "value"], ["asc", "desc"]);

            let groupData = _(completeData)
                .groupBy("_id.concept")
                .map((v, k) => {
                    return v.map(item => [k, item.value])
                })
                .map((item) => _.flatten(item));

            return [{
                name: "Expenses",
                data: groupData
            }];
        }
    }

    private _afterFiveBest(rawData: any) {
        let data = _.orderBy(rawData, "value", "desc");
        let sum = 0;

        let others = _(data)
            .groupBy("_id.frequency")
            .map((v, k) => ({
                _id: {
                    concept: "Others",
                    frequency: k
                },
                value: _.sumBy(v, "value")
            }))
            .orderBy("_id.frequency", "desc")
            .value();

        return others;
    }
    
    private _topFivBestSeller(rawData: any) {
        return _(rawData)
            .groupBy('_id.concept')
            .map((v, k) => ({
                concept: k,
                value: _.sumBy(v, 'value')
            }))
            .orderBy('value', 'desc')
            .filter((item, index) => {
                if (index >= 4) { 
                    return;
                }
                return item;
            })
            .map(item => item.concept);
    }
}