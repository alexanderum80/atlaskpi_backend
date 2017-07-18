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
        $match: {
            'employee.type': { $eq: 'f' },
            'employee.role': { $eq: 'Doctor' }
        }
    },
    {
        frequency: true,
        $project: {
            'product': 1,
            'employee': 1,
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
        $project: {
            avg: {
                $divide: [ '$value' ]
            }
        }
    },
    {
        $sort: {
            frequency: 1
        }
    }
];

export class AvgRevenueByFTPhysician extends KpiBase {

    constructor(sales: ISaleModel) {
        super(sales, _.clone(aggregate));
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.executeQuery('product.from', dateRange, frequency);
    }

    getSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        return new Promise<any>((resolve, reject) => {
            // get total physicians first
            let query = this.findStage('dateRange', '$match').$match;
            query['product.from'] = { '$gte': dateRange.from, '$lte': dateRange.to };

            this.model.find(query).distinct('employee.externalId', function(err, employeeIds) {
                let totalEmployees = employeeIds ? employeeIds.length : 0;
                let projectStages =  that.findStages('$project');

                let divideArg1 = projectStages[1].$project.avg.$divide[0];
                projectStages[1].$project.avg.$divide = [
                    divideArg1,
                    totalEmployees
                ];

                that.executeQuery('product.from', dateRange, frequency).then(data => {
                    resolve(that._toSeries(data, frequency));
                }).catch(e => {
                    console.error(e);
                });
            });
        });
    }

    private _toSeries(rawData: any[], withFrequency: FrequencyEnum) {
        return [{
            name: 'Avg',
            data: _.sortBy(rawData, '_id.frequency')
                   .map(item => [ item._id.frequency, item.avg ])
        }];
    }

}