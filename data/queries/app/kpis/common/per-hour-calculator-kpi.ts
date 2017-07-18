import { RevenueByIds, IRevenueByIdKpi } from '../common/revenue-by-ids';
import { WorkHoursByIds, IWorkHoursByIdKpi } from '../common/work-hours-by-ids';
import { IWorkLogModel } from '../../../../models/app/work-log/IWorkLog';
import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { IKpiBase, KpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

export class PerHourCalculator {

    constructor(private _idAggregate: AggregateStage[],
                private _sales: ISaleModel,
                private _revenueKpi: IRevenueByIdKpi,
                private _hoursKpi: IWorkHoursByIdKpi) {
        this._validateArguments();
    }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        let ids;
        let hours;
        let revenue;

        return this._getEmployeeIds(this._idAggregate, dateRange)
                   .then((externalIds) => {
                        ids = externalIds;
                        that._hoursKpi.setExternalids(ids);
                        return that._hoursKpi.getSeries(dateRange, frequency);
                   })
                   .then((h) => {
                        hours = h;
                        that._revenueKpi.setExternalids(ids);
                        return that._revenueKpi.getSeries(dateRange, frequency);
                   })
                   .then((r) => {
                       revenue = r;
                       return that._calcRevenuePerHour(revenue, hours);
                   });
    }

    getSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        return this.getData(dateRange, frequency);
    }

    private _getEmployeeIds(aggregate: AggregateStage[], dateRange: IDateRange): Promise<any> {
        let idsKpi = new KpiBase(this._sales, aggregate);

        return idsKpi.executeQuery('product.from', dateRange)
               .then((ids) => Promise.resolve(ids.map(i => (<any>i).externalId)))
               .catch((err) => Promise.reject(err));
    }

    private _calcRevenuePerHour(revenue: any[], hours: any[]): Promise<any> {
        let revenuePerHour = [];

        hours.forEach(h => {
                let rPerHour = this._getRevenuePerHour(h._id.frequency, revenue, hours);
                if (!rPerHour) { return; };
                revenuePerHour.push({ _id: { frequency: h._id.frequency },
                                      value: rPerHour  });
        });
        return Promise.resolve(revenuePerHour);
    }

    private _getRevenuePerHour(date: string, value: any[], hours: any[]) {
        let hoursOfDay = hours.find(h => h._id.frequency === date);
        let revenueOfDay = value.find(h => h._id.frequency === date);
        if (!hoursOfDay || hoursOfDay.hours === 0) { return 0; };
        if (!revenueOfDay) { return 0; };
        return revenueOfDay.value / hoursOfDay.hours;
    }

    private _validateArguments(): void {
        if (!this._idAggregate || !this._sales ||
            !this._revenueKpi || !this._hoursKpi) {
                throw 'Missing or Unitialized arguments. ';
        }
    }

}
