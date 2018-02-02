import { IWidgetDocument } from '../domain/app/widgets/widget';
import { IChartDocument } from '../domain/app/charts/chart';
import { Widgets } from '../domain/app/widgets/widget.model';
import { Charts } from '../domain/app/charts/chart.model';
import { GroupingMap } from '../app_modules/charts/queries/chart-grouping-map';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { Inventory } from '../domain/app/inventory/inventory.model';
import { Expenses } from '../domain/app/expenses/expense.model';
import { Sales } from '../domain/app/sales/sale.model';
import { IDocumentExist, IKPIDataSourceHelper, IKPIDocument } from '../domain/app/kpis/kpi';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import {
    sortBy,
    isObject
} from 'lodash';
import * as mongoose from 'mongoose';

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
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Charts.name) private _chart: Charts,
        @inject(Widgets.name) private _widget: Widgets
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

    removeKpi(id: string): Promise<any> {
        const that = this;

        return new Promise<any>((resolve, reject) => {

            that._kpiInUseByModel(id).then(res => {
                // check if kpi is in use by another model
                const { chart, widget, complexKPI } = res;
                const modelExists: number = chart.length || widget.length || complexKPI.length;

                if (modelExists) {
                    reject({ message: 'KPIs is being used by ', entity: res, error: 'KPIs is being used by '});
                    return;
                }

                // remove kpi when not in use
                that._kpis.model.removeKPI(id).then(document => {
                    resolve(document);
                    return;
                }).catch(err => {
                    reject(err);
                    return;
                });
            }).catch(err => {
                reject(err);
                return;
            });
        });
    }

    private _kpiInUseByModel(id: string): Promise<IDocumentExist> {
        const that = this;

        return new Promise<IDocumentExist>((resolve, reject) => {
            // reject if no id is provided
            if (!id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }

            // query to find if kpi is in use by chart, widget, or complexkpi
            const findCharts = this._chart.model.find({ kpis: { $in: [id] } });
            const findWidgets = this._widget.model.find({
                'numericWidgetAttributes.kpi': id
            });

            // contain regex expression to use for complex kpi
            const expression = new RegExp(id);
            const findComplexKpi = this._kpis.model.find({
                expression: {
                    $regex: expression
                }
            });

            let documentExists: any = {};

            Promise.all([findCharts, findWidgets, findComplexKpi])
                .spread((charts: IChartDocument[], widgets: IWidgetDocument[], complexKPI: IKPIDocument[]) => {
                    documentExists = {
                        chart: charts,
                        widget: widgets,
                        complexKPI
                    };

                    resolve(documentExists);
                    return;
                }).catch(err => {
                    reject(err);
                    return;
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