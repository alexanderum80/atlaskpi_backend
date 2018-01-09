import { KPIs } from '../domain/app/kpis/kpi.model';
import { Inventory } from '../domain/app/inventory/inventory.model';
import { Expenses } from '../domain/app/expenses/expense.model';
import { Sales } from '../domain/app/sales/sale.model';
import { GroupingMap } from '../app_modules/charts/queries/chart-grouping-map';
import { IKPIDataSourceHelper, IKPIDocument } from '../domain/app/kpis/kpi';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

const codeMapper = {
    'Revenue': 'sales',
    'Expenses': 'expenses'
};

export class KpiService {
    constructor(
        @inject(Sales.name) private _saleModel,
        @inject(Expenses.name) private _expenseModel,
        @inject(Inventory.name) private _inventoryModel,
        @inject(KPIs.name) private _kpis: KPIs
    ) {}

    listKpis() {
        const that = this;
        return new Promise<IKPIDocument[]>((resolve, reject) => {
             return that._kpis.model
                   .find()
                   .then((kpis) => {
                       kpis.forEach(kpi => that.formatAvailableGroupings(kpi));
                       resolve(kpis);
                   })
                   .catch(e => reject(e));
        });
    }

    formatAvailableGroupings(kpi: IKPIDocument) {
        const code = kpi.baseKpi || kpi.code;
        this.GetGroupingsExistInCollectionSchema(code).then(availableFields => {
            kpi.availableGroupings = availableFields;
        });
    }

    GetGroupingsExistInCollectionSchema(schemaName: string): any {
        const that = this;
        // get sales and expense mongoose models
        const model = {
            sales: this._saleModel,
            expenses: this._expenseModel,
            inventory: this._inventoryModel
        };
        // get sales or expense mongoose models
        const collection = GroupingMap[schemaName];

        let permittedFields = [];
        const collectionQuery = [];

        return new Promise<any>((resolve, reject) => {
            // prop: i.e. 'location', 'concept', 'customerName'
            Object.keys(collection).forEach(prop => {
                const field = collection[prop];

                collectionQuery.push(model[schemaName].aggregate([{
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

                Promise.all(collectionQuery).then(fieldExist => {
                    // array of arrays with objects
                    if (fieldExist) {
                        // convert to single object
                        const formatToObject = getObjects(fieldExist);
                        // get the keys from the formatToObject
                        permittedFields = Object.keys(formatToObject);
                        return resolve(sortBy(permittedFields));
                    }
                });
            });
        });
    }
}