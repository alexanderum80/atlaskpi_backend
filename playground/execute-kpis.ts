import { RentExpenseRatio } from '../data/queries/app/kpis/expenses/rent-expense-ratio';
import { TotalOperatingExpenses } from '../data/queries/app/kpis/expenses/total-operating-expenses';
import { RevenueRateByFTEmployee } from '../data/queries/app/kpis/financial/revenue-rate-per-hour-fte';
import { PhysicianRevenueRateHour } from '../data/queries/app/kpis/financial/revenue-rate-per-hour-physian';
import { OtherSalesRatio } from '../data/queries/app/kpis/operational/other-sales-ratio';
import {
    AmbulatorySurgeryCenterServiceRatio
} from '../data/queries/app/kpis/operational/ambulatory-surgery-center-service-ratio';
import {
    ConsultingResearchServiceRatio
} from '../data/queries/app/kpis/operational/consulting-research-service-ratio';
import { ProfesionalSalesRatio } from '../data/queries/app/kpis/operational/professional-service-ratio';
import { RetailSalesRatio } from '../data/queries/app/kpis/operational/retail-sales-ratio';
import { TotalRevenue } from '../data/queries/app/kpis/common/total-revenue';
import {
    IndividualNonPhysicianRevenueRatePerHour
} from '../data/queries/app/kpis/more-financial/indiviual-non-physician-revenue-per-hour';
import { ConsultingResearchSales } from '../data/queries/app/kpis/more-financial/consulting-research-sales';
import { AmbulatorySurgeryCenterSales } from '../data/queries/app/kpis/more-financial/ambulatory-surgery-center-sales';
import { RevenueByIds } from '../data/queries/app/kpis/common/revenue-by-ids';
import { WorkHoursByIds } from '../data/queries/app/kpis/common/work-hours-by-ids';
import { AestheticianRevenueRatePerHour } from '../data/queries/app/kpis/more-financial/aesthetician-revenue-per-hour';
import { ProfesionalServiceSales } from '../data/queries/app/kpis/more-financial/profesional-service-sales';
import { Chart } from '../data/queries/app/charts/charts/chart';
import { PieChart } from '../data/queries/app/charts/charts/pie.chart';
import { AvgRevenueByFTNonPhysician } from '../data/queries/app/kpis/financial/avg-rev-per-non-fte-physician';
import { AvgRevenueByFTPhysician } from '../data/queries/app/kpis/financial/avg-rev-per-fte-physician';
import { NetRevenueByFTE } from '../data/queries/app/kpis/financial/net-revenue-by-fte';
import { RetailSales } from '../data/queries/app/kpis/financial/retail-sales';
import { IDateRange } from '../data/models/common';
import { RevenueByServiceLine } from '../data/queries/app/kpis/financial/revenue-by-service-line';
import { getContext } from '../data/models/app/app-context';
import { FrequencyEnum } from '../data/models/common';
import * as mongoose from 'mongoose';

export function executeKpis() {

    mongoose.set('debug', true);

    getContext('mongodb://localhost/test-cat-6').then(ctx => {

        let dateRange: IDateRange = {
            from: new Date('2015-01-01'),
            to: new Date('2018-12-31')
        };
        let frequency = FrequencyEnum.Monthly;

        // let kpi = new AestheticianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);

        let kpi = new NetRevenueByFTE(ctx.Sale);

        kpi.getData(dateRange, frequency).then(data => {

            // let definition = `{r
            //     "title": {
            //         "text": "Chart Title"
            //     },
            //     "subtitle": {
            //         "text": "Subtitle for Chart"
            //     },
            //     "plotOptions": {
            //         "pie": {
            //             "dataLabels": {
            //                 "enabled": true
            //             },
            //             "showInLegend": false
            //         }
            //     }
            // }`;

            let series = data;
            // let chart = new Chart(definition, series);

            console.log(JSON.stringify(data));
        });

    });
}