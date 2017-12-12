import { ISaleModel } from '../../models/app/sales';
import { IExpenseModel } from '../../models/app/expenses';


export class KpiService {
    salesModel: ISaleModel;
    expensesModel: IExpenseModel;

    constructor(saleModel: ISaleModel, expenseModel: IExpenseModel) {
        this.salesModel = saleModel;
        this.expensesModel = expenseModel;
    }

}