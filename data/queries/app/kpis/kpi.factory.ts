import { ProfesionalSalesRatio } from './operational/professional-service-ratio';
import { PhysicianRevenueRateHour } from './financial/revenue-rate-per-hour-physian';
import { RevenueRateByFTEmployee } from './financial/revenue-rate-per-hour-fte';
import { RetailSalesRatio } from './operational/retail-sales-ratio';
import { IAppModels } from '../../../models/app/app-models';
import { TotalExpense } from './common/total-expense';
import { CostOfGoodSold } from "./common/cost-of-goods-sold";
import { ExpenseByCategory } from "./common/expense-by-category";
import { ExpenseRatio } from './common/expense-ratio';
import { PayrollExpenseRatio } from './common/payroll-expense-ratio';
import { AvgRevenueByFTPhysician, NetRevenueByFTE, RevenueByServiceLine } from './financial';
import { AvgRevenueByFTAesthetician } from './financial/avg-rev-per-fte-aesthetician';
import { AvgRevenueByFTNonPhysician } from './financial/avg-rev-per-non-fte-physician';
import { RetailSales } from './financial/retail-sales';
import { SalesByProduct } from './financial/sales-by-product';
import { TotalRevenue } from './financial/total-revenue';
import { AestheticianRevenueRatePerHour } from './more-financial/aesthetician-revenue-per-hour';
import { AmbulatorySurgeryCenterSales } from './more-financial/ambulatory-surgery-center-sales';
import { ConsultingResearchSales } from './more-financial/consulting-research-sales';
import { IndividualNonPhysicianRevenueRatePerHour } from './more-financial/indiviual-non-physician-revenue-per-hour';
import { ProfesionalServiceSales } from './more-financial/profesional-service-sales';
import { AmbulatorySurgeryCenterServiceRatio } from './operational/ambulatory-surgery-center-service-ratio';
import { ConsultingResearchServiceRatio } from './operational/consulting-research-service-ratio';
import { OtherSalesRatio } from './operational/other-sales-ratio';

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

        // Expenses
        case 'TotalExpense':
            return new TotalExpense(ctx.Expense);

        case 'CostOfGoodSold':
            return new CostOfGoodSold(ctx.Expense);
        case 'ExpenseByCategory':
            return new ExpenseByCategory(ctx.Expense);
        case 'ExpenseRatio':
            return new ExpenseRatio(ctx.Expense, ctx.Sale);
        case 'PayrollExpenseRatio':
            return new PayrollExpenseRatio(ctx.Expense, ctx.Sale);

        default:
            return null;
    }
}