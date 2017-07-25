

// export function executeKpis() {

//     mongoose.set('debug', true);

//     getContext('mongodb://localhost/saltz-plastic-surgery').then(ctx => {

//         let dateRange: IDateRange = {
//             from: new Date('2016-01-01'),
//             to: new Date('2016-05-31')
//         };

//         let frequency = FrequencyEnum.Monthly;

//         // let kpi = new AestheticianRevenueRatePerHour(ctx.Sale, ctx.WorkLog);

//         // let kpi = new RentExpenseRatio(ctx.Sale, ctx.Expense);
//         // let kpi = new TotalExpense(ctx.Expense);
//         // let kpi = new CostOfGoodSold(ctx.Expense);
//         // let kpi = new ExpenseByCategory(ctx.Expense);
//         // let kpi = new RevenueByServiceLine(ctx.Sale);
//         // let kpi = new SalesByProduct(ctx.Sale);
//         // let kpi = new RetailSalesRatio(ctx.Sale);
//         // let kpi = new ExpenseRatio(ctx.Expense, ctx.Sale);
//         // let kpi = new PayrollExpenseRatio(ctx.Expense, ctx.Sale);
//         // let kpi = new TotalPayroll(ctx.Expense);

//         let kpi = new SalesByProduct(ctx.Sale);

//         kpi.getData(dateRange, frequency).then(res => {

//             let series = res;

//             console.log(JSON.stringify(res));
//             let processor = new KPIPostProcessorExtention();
//         });

//     });
// }