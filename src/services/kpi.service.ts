import { GroupingMap } from '../app_modules/charts/queries/chart-grouping-map';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { Inventory } from '../domain/app/inventory/inventory.model';
import { Expenses } from '../domain/app/expenses/expense.model';
import { Sales } from '../domain/app/sales/sale.model';
import { IKPIDataSourceHelper, IKPIDocument } from '../domain/app/kpis/kpi';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import {
    sortBy,
    isObject
} from 'lodash';

const codeMapper = {
    'Revenue': 'sales',
    'Expenses': 'expenses'
};

@injectable()
export class KpiService {
    constructor(
        @inject(Sales.name) private _saleModel: Sales,
        @inject(Expenses.name) private _expenseModel: Expenses,
        @inject(Inventory.name) private _inventoryModel,
        @inject(KPIs.name) private _kpis: KPIs
    ) {}

    GetGroupingsExistInCollectionSchema(schemaName: string): Promise<any> {
        const that = this;
        // get sales and expense mongoose models
        const model = {
            sales: this._saleModel.model,
            expenses: this._expenseModel.model,
            inventory: this._inventoryModel.model
        };
        // get sales or expense mongoose models
        const gMap = codeMapper[schemaName];
        const collection = GroupingMap[gMap];
        const modelKey = codeMapper[schemaName];

        let permittedFields = [];
        const collectionQuery = [];

        return new Promise<string[]>((resolve, reject) => {
            // prop: i.e. 'location', 'concept', 'customerName'
            Object.keys(collection).forEach(prop => {
                const field = collection[prop];

                collectionQuery.push(model[modelKey].aggregate([{
                    $match: {
                        [field]: { $exists: true}
                    }
                }, {
                    $project: {
                        _id: 0,
                        [prop]: field
                    }
                }, {
                    $limit: 1
                }]));
            });

            Promise.all(collectionQuery).then(fieldExist => {
                // array of arrays with objects
                if (fieldExist) {
                    // convert to single object
                    const formatToObject = this._getObjects(fieldExist);
                    // get the keys from the formatToObject
                    permittedFields = Object.keys(formatToObject);
                    return resolve(sortBy(permittedFields));
                }
            });
        });
    }

    private _getObjects(arr: any[]): any {
        if (!arr) { return; }
        const newObject = {};
        arr.forEach(singleArray => {
            if (singleArray && Array.isArray(singleArray)) {
                singleArray.forEach(obj => {
                    if (isObject) {
                        Object.assign(newObject, obj);
                    }
                });
            }
        });
        return newObject;
    }
}