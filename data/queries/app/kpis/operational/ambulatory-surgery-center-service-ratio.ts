import { RatioSalesCalculatorKPI } from '../common/ratio-sales-calculator-kpi';
import { AmbulatorySurgeryCenterSales } from '../more-financial/ambulatory-surgery-center-sales';
import { TotalRevenue } from '../common/total-revenue';
import { IWorkLogModel } from '../../../../models/app/work-log/IWorkLog';
import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

export class AmbulatorySurgeryCenterServiceRatio {

    constructor(private _sales: ISaleModel) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        let totalRevenueKpi = new TotalRevenue(this._sales);
        let ambulatoryRevenueKpi = new AmbulatorySurgeryCenterSales(this._sales, true);

        let ambulatorySurgeryCenterServiceRatioKpi = new RatioSalesCalculatorKPI(ambulatoryRevenueKpi,
                                                                                 totalRevenueKpi);

        return ambulatorySurgeryCenterServiceRatioKpi.getData(dateRange, frequency);
    }

    getSeries(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        const that = this;
        return new Promise((resolve, reject) => {
                that.getData(dateRange, frequency).then(data => {
                    resolve(that._toSeries(data));
            }), (e) => reject(e);
        });        
    }

    private _toSeries(rawData: any[]) {
        return [{
            name: 'Ambulatory Surgery Center Service Ratio',
            data: rawData.map(item => [ item._id.frequency, item.value ])
        }];
    }

}
