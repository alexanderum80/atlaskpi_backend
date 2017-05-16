import { RatioSalesCalculatorKPI } from '../common/ratio-sales-calculator-kpi';
import { OtherSales } from '../common/other-sales';
import { TotalRevenue } from '../common/total-revenue';
import { IWorkLogModel } from '../../../../models/app/work-log/IWorkLog';
import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

export class OtherSalesRatio {

    constructor(private _sales: ISaleModel) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        let totalRevenueKpi = new TotalRevenue(this._sales);
        let otherRevenueKpi = new OtherSales(this._sales);

        let otherSalesRatioKpi = new RatioSalesCalculatorKPI(otherRevenueKpi,
                                                             totalRevenueKpi);

        return new Promise((resolve, reject) => {
                otherSalesRatioKpi.getData(dateRange, frequency).then(data => {
                    resolve(that._toSeries(data));
            }), (e) => reject(e);
        });
    }

    private _toSeries(rawData: any[]) {
        return [{
            name: 'Other Sales Ratio',
            data: rawData.map(item => [ item._id.frequency, item.ratio ])
        }];
    }
}
