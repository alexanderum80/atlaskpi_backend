import { ISaleModel } from '../../models/app/sales';
import { IExpenseModel } from '../../models/app/expenses';
import { IInventoryModel } from '../../models/app/inventory/index';


export class KpiService {
    constructor(
        public salesModel: ISaleModel,
        public expensesModel: IExpenseModel,
        public inventoryModel: IInventoryModel) { }

}