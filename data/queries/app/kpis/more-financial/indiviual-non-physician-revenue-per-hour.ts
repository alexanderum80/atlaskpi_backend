import { PerHourCalculator } from '../common/per-hour-calculator-kpi';
import { RevenueByIds } from '../common/revenue-by-ids';
import { WorkHoursByIds } from '../common/work-hours-by-ids';
import { IWorkLogModel } from '../../../../models/app/work-log/IWorkLog';
import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

const idAggregate: AggregateStage[] = [
    {
        dateRange: true,
        $match:
        { 'employee.role': { $ne: 'Physician' } }
    },
    { $group: { _id: { employeeId: '$employee.externalId' } } },
    { $project: { _id: 0, externalId: '$_id.employeeId' } }
];

export class IndividualNonPhysicianRevenueRatePerHour {

    constructor(private _sales: ISaleModel, private _workLog: IWorkLogModel) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        let hoursKpi = new WorkHoursByIds(this._workLog);
        let revenueKpi = new RevenueByIds(this._sales);

        let individualNonPhysicianRevenueRatePerHourKpi = new PerHourCalculator(
            idAggregate, this._sales, revenueKpi, hoursKpi);
            
        return individualNonPhysicianRevenueRatePerHourKpi.getData(dateRange, frequency);
    }
    
    getSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return new Promise<any>((resolve, reject) => {
            that.getData(dateRange, frequency)
            .then(data => {
                resolve(that._toSeries(data));
            }, (e) => reject(e));
        });        

    }

    private _toSeries(rawData: any[]) {
        return [{
            name: 'Individual Non Physician Revenue Rate Per Hour',
            data: rawData.map(item => [ item._id.frequency, item.value ])
        }];
    }

}
