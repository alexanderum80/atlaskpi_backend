import { ProfesionalSalesRatio } from './operational/professional-service-ratio';
import { PhysicianRevenueRateHour } from './financial/revenue-rate-per-hour-physian';
import { RevenueRateByFTEmployee } from './financial/revenue-rate-per-hour-fte';
import { RetailSalesRatio } from './operational/retail-sales-ratio';
import { OtherSalesRatio } from './operational/other-sales-ratio';
import { ConsultingResearchServiceRatio } from './operational/consulting-research-service-ratio';
import { AmbulatorySurgeryCenterServiceRatio } from './operational/ambulatory-surgery-center-service-ratio';
import { ProfesionalServiceSales } from './more-financial/profesional-service-sales';
import { IndividualNonPhysicianRevenueRatePerHour } from './more-financial/indiviual-non-physician-revenue-per-hour';
import { ConsultingResearchSales } from './more-financial/consulting-research-sales';
import { AmbulatorySurgeryCenterSales } from './more-financial/ambulatory-surgery-center-sales';
import { AestheticianRevenueRatePerHour } from './more-financial/aesthetician-revenue-per-hour';
import { RetailSales } from './financial/retail-sales';
import { TotalRevenue } from './financial/total-revenue';
import { SalesByProduct } from './financial/sales-by-product';
import { AvgRevenueByFTAesthetician } from './financial/avg-rev-per-fte-aesthetician';
import { AvgRevenueByFTNonPhysician } from './financial/avg-rev-per-non-fte-physician';
import {
    RevenueByServiceLine,
    NetRevenueByFTE,
    AvgRevenueByFTPhysician
} from './financial';
import { IAppModels } from '../../../models/app/app-models';

export function getKPI(code: string, ctx: IAppModels) {
    switch (code) {
        // Financial
        case 'RevenueByServiceLine':
            return new RevenueByServiceLine(ctx.Sale);
        case 'NetRevenueByFTE':
            return new NetRevenueByFTE(ctx.Sale);
        case 'AvgRevenueByFTPhysician':
            return new AvgRevenueByFTPhysician(ctx.Sale);
        case 'AvgRevenueByFTNonPhysician':
            return new AvgRevenueByFTNonPhysician(ctx.Sale);
        case 'AvgRevenueByFTAesthetician':
            return new AvgRevenueByFTAesthetician(ctx.Sale);
        case 'SalesByProduct':
            return new SalesByProduct(ctx.Sale);
        case 'TotalRevenue':
            return new TotalRevenue(ctx.Sale);
        case 'RetailSales':
            return new RetailSales(ctx.Sale);
        case 'RevenueRateByFTEmployee':
            return new RevenueRateByFTEmployee(ctx.Sale, ctx.WorkLog);
        case 'PhysicianRevenueRateHour':
            return new PhysicianRevenueRateHour(ctx.Sale, ctx.WorkLog);

        // More Financial
        case 'AestheticianRevenueRatePerHour':
            return new AestheticianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);
        case 'AmbulatorySurgeryCenterSales':
            return new AmbulatorySurgeryCenterSales(ctx.Sale);
        case 'ConsultingResearchSales':
            return new ConsultingResearchSales(ctx.Sale);
        case 'IndividualNonPhysicianRevenueRatePerHour':
            return new IndividualNonPhysicianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);
        case 'ProfesionalServiceSales':
            return new ProfesionalServiceSales(ctx.Sale);

        // Operational
        case 'AmbulatorySurgeryCenterServiceRatio':
            return new AmbulatorySurgeryCenterServiceRatio(ctx.Sale);
        case 'ConsultingResearchServiceRatio':
            return new ConsultingResearchServiceRatio(ctx.Sale);
        case 'OtherSalesRatio':
            return new OtherSalesRatio(ctx.Sale);
        case 'ProfesionalSalesRatio':
            return new ProfesionalSalesRatio(ctx.Sale);
        case 'RetailSalesRatio':
            return new RetailSalesRatio(ctx.Sale);

        default:
            return null;
    }
}