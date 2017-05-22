"use strict";
var professional_service_ratio_1 = require("./operational/professional-service-ratio");
var revenue_rate_per_hour_physian_1 = require("./financial/revenue-rate-per-hour-physian");
var revenue_rate_per_hour_fte_1 = require("./financial/revenue-rate-per-hour-fte");
var retail_sales_ratio_1 = require("./operational/retail-sales-ratio");
var other_sales_ratio_1 = require("./operational/other-sales-ratio");
var consulting_research_service_ratio_1 = require("./operational/consulting-research-service-ratio");
var ambulatory_surgery_center_service_ratio_1 = require("./operational/ambulatory-surgery-center-service-ratio");
var profesional_service_sales_1 = require("./more-financial/profesional-service-sales");
var indiviual_non_physician_revenue_per_hour_1 = require("./more-financial/indiviual-non-physician-revenue-per-hour");
var consulting_research_sales_1 = require("./more-financial/consulting-research-sales");
var ambulatory_surgery_center_sales_1 = require("./more-financial/ambulatory-surgery-center-sales");
var aesthetician_revenue_per_hour_1 = require("./more-financial/aesthetician-revenue-per-hour");
var retail_sales_1 = require("./financial/retail-sales");
var total_revenue_1 = require("./financial/total-revenue");
var sales_by_product_1 = require("./financial/sales-by-product");
var avg_rev_per_fte_aesthetician_1 = require("./financial/avg-rev-per-fte-aesthetician");
var avg_rev_per_non_fte_physician_1 = require("./financial/avg-rev-per-non-fte-physician");
var financial_1 = require("./financial");
function getKPI(code, ctx) {
    switch (code) {
        // Financial
        case 'RevenueByServiceLine':
            return new financial_1.RevenueByServiceLine(ctx.Sale);
        case 'NetRevenueByFTE':
            return new financial_1.NetRevenueByFTE(ctx.Sale);
        case 'AvgRevenueByFTPhysician':
            return new financial_1.AvgRevenueByFTPhysician(ctx.Sale);
        case 'AvgRevenueByFTNonPhysician':
            return new avg_rev_per_non_fte_physician_1.AvgRevenueByFTNonPhysician(ctx.Sale);
        case 'AvgRevenueByFTAesthetician':
            return new avg_rev_per_fte_aesthetician_1.AvgRevenueByFTAesthetician(ctx.Sale);
        case 'SalesByProduct':
            return new sales_by_product_1.SalesByProduct(ctx.Sale);
        case 'TotalRevenue':
            return new total_revenue_1.TotalRevenue(ctx.Sale);
        case 'RetailSales':
            return new retail_sales_1.RetailSales(ctx.Sale);
        case 'RevenueRateByFTEmployee':
            return new revenue_rate_per_hour_fte_1.RevenueRateByFTEmployee(ctx.Sale, ctx.WorkLog);
        case 'PhysicianRevenueRateHour':
            return new revenue_rate_per_hour_physian_1.PhysicianRevenueRateHour(ctx.Sale, ctx.WorkLog);
        // More Financial
        case 'AestheticianRevenueRatePerHour':
            return new aesthetician_revenue_per_hour_1.AestheticianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);
        case 'AmbulatorySurgeryCenterSales':
            return new ambulatory_surgery_center_sales_1.AmbulatorySurgeryCenterSales(ctx.Sale);
        case 'ConsultingResearchSales':
            return new consulting_research_sales_1.ConsultingResearchSales(ctx.Sale);
        case 'IndividualNonPhysicianRevenueRatePerHour':
            return new indiviual_non_physician_revenue_per_hour_1.IndividualNonPhysicianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);
        case 'ProfesionalServiceSales':
            return new profesional_service_sales_1.ProfesionalServiceSales(ctx.Sale);
        // Operational
        case 'AmbulatorySurgeryCenterServiceRatio':
            return new ambulatory_surgery_center_service_ratio_1.AmbulatorySurgeryCenterServiceRatio(ctx.Sale);
        case 'ConsultingResearchServiceRatio':
            return new consulting_research_service_ratio_1.ConsultingResearchServiceRatio(ctx.Sale);
        case 'OtherSalesRatio':
            return new other_sales_ratio_1.OtherSalesRatio(ctx.Sale);
        case 'ProfesionalSalesRatio':
            return new professional_service_ratio_1.ProfesionalSalesRatio(ctx.Sale);
        case 'RetailSalesRatio':
            return new retail_sales_ratio_1.RetailSalesRatio(ctx.Sale);
        default:
            return null;
    }
}
exports.getKPI = getKPI;
//# sourceMappingURL=kpi.factory.js.map