import { RatioSalesCalculatorKPI } from '../common/ratio-sales-calculator-kpi';
import { TotalRevenue } from '../common/total-revenue';
import { RetailSales } from '../common/retail-sales';
import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

export class RetailSalesRatio {

    constructor(private _sales: ISaleModel) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;
        let totalRevenueKpi = new TotalRevenue(this._sales);
        let retailRevenueKpi = new RetailSales(this._sales);

        let retailSalesRatioKpi = new RatioSalesCalculatorKPI(retailRevenueKpi,
                                                              totalRevenueKpi);

        return new Promise((resolve, reject) => {
            retailSalesRatioKpi.getData(dateRange, frequency).then(data => {
                resolve(that._toSeries(data));
            });
        });
    }

    private _toSeries(rawData: any[]) {
        return [{
            name: 'Retail Sales Ratio',
            data: rawData.map(item => [ item._id.frequency, item.ratio ])
        }];
    }
}
