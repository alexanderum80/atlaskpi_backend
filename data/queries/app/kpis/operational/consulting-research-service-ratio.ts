import { RatioSalesCalculatorKPI } from '../common/ratio-sales-calculator-kpi';
import { ConsultingResearchSales } from '../more-financial/consulting-research-sales';
import { TotalRevenue } from '../common/total-revenue';
import { IWorkLogModel } from '../../../../models/app/work-log/IWorkLog';
import { ISaleModel } from '../../../../models/app/sales';
import { AggregateStage } from '../aggregate';
import { KpiBase, IKpiBase } from '../kpi-base';
import { IAppModels } from '../../../../models/app/app-models';
import { FrequencyEnum } from '../../../../models/common/frequency-enum';
import { IDateRange } from '../../../../models/common/date-range';
import * as Promise from 'bluebird';

export class ConsultingResearchServiceRatio {

    constructor(private _sales: ISaleModel) { }

    getData(dateRange: IDateRange, frequency?: FrequencyEnum): Promise<any> {
        let that = this;

        let totalRevenueKpi = new TotalRevenue(this._sales);
        let consultingResearchRevenueKpi = new ConsultingResearchSales(this._sales, true);

        let consultingResearchServiceRatioKPI = new RatioSalesCalculatorKPI(consultingResearchRevenueKpi,
                                                                            totalRevenueKpi);

        return consultingResearchServiceRatioKPI.getData(dateRange, frequency);
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
            name: 'Consulting Research Service Ratio',
            data: rawData.map(item => [ item._id.frequency, item.value ])
        }];
    }

}
