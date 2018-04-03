import { inject, injectable } from 'inversify';
import { isObject } from 'lodash';
import { DocumentQuery } from 'mongoose';
import { intersection } from 'lodash';

import { IChartDocument } from '../domain/app/charts/chart';
import { Charts } from '../domain/app/charts/chart.model';
import { IExpenseModel } from '../domain/app/expenses/expense';
import { Expenses } from '../domain/app/expenses/expense.model';
import { IInventoryModel } from '../domain/app/inventory/inventory';
import { Inventory } from '../domain/app/inventory/inventory.model';
import { IDocumentExist, IKPI, IKPIDocument, KPITypeEnum, KPITypeMap } from '../domain/app/kpis/kpi';
import { KPIExpressionHelper } from '../domain/app/kpis/kpi-expression.helper';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { ISaleModel } from '../domain/app/sales/sale';
import { Sales } from '../domain/app/sales/sale.model';
import { IVirtualSourceDocument } from '../domain/app/virtual-sources/virtual-source';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { IWidgetDocument } from '../domain/app/widgets/widget';
import { Widgets } from '../domain/app/widgets/widget.model';
import { IMutationResponse } from '../framework/mutations/mutation-response';

const codeMapper = {
    'Revenue': 'sales',
    'Expenses': 'expenses'
};

export interface IGroupingsModel {
    sales: ISaleModel;
    expenses: IExpenseModel;
    inventory: IInventoryModel;
}

@injectable()
export class KpiService {
    constructor(
        @inject(Sales.name) private _saleModel: Sales,
        @inject(Expenses.name) private _expenseModel: Expenses,
        @inject(Inventory.name) private _inventoryModel,
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Charts.name) private _chart: Charts,
        @inject(Widgets.name) private _widget: Widgets,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources
    ) {}

    async getKpis(): Promise<IKPIDocument[]> {
        const kpis = await this._kpis.model.find({});
        const virtualSources = await this._virtualSources.model.find({});

        // process available groupings
        kpis.forEach(k => {
            const kpiSources: string[] = [];
            this._getKpiSources(k, kpis).forEach(s => kpiSources.push(s));

            // find common field paths on the sources
            k.groupings = this._getCommonSourcePaths(kpiSources, virtualSources);
        });

        return kpis;
    }

    async getKpi(id: string): Promise<IKPIDocument> {
        const doc = await this._kpis.model.findOne({ _id: id });
        const virtualSources = await this._virtualSources.model.find({});

        doc.expression = KPIExpressionHelper.PrepareExpressionField(doc.type, doc.expression);

        return doc;
    }

    async createKpi(input: IKPI): Promise<IKPIDocument> {
        const kpiType = KPITypeMap[input.type];
        const virtualSources = await this._virtualSources.model.find({});

        if (input.filter) {
            input.filter = KPIFilterHelper.ComposeFilter(kpiType, virtualSources, input.expression, input.filter);
        }

        if (kpiType === KPITypeEnum.Simple || KPITypeEnum.ExternalSource) {
            input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);
        }

        return await this._kpis.model.createKPI(input);
    }

    async updateKpi(id: string, input: IKPI): Promise<IKPIDocument> {
        const kpiType = KPITypeMap[input.type];
        const virtualSources = await this._virtualSources.model.find({});

        input.filter = KPIFilterHelper.ComposeFilter(kpiType, virtualSources, input.expression, input.filter);
        input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);

        return await this._kpis.model.updateKPI(id, input);
    }

    removeKpi(id: string): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {

            that._kpiInUseByModel(id).then((documents: IDocumentExist) => {
                // check if kpi is in use by another model
                const { chart, widget, complexKPI } = documents;
                const modelExists: number = chart.length || widget.length || complexKPI.length;

                if (modelExists) {
                    reject({ message: 'KPIs is being used by ', entity: documents, error: 'KPIs is being used by '});
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

    private _getKpiSources(kpi: IKPIDocument, kpis: IKPIDocument[]): string[] {
        if (kpi.baseKpi) {
            // return fields for base kpi Revenue or Expenses
            switch (kpi.baseKpi) {
                case 'Expenses':
                    return ['expenses'];
                case 'Revenue':
                    return ['sales'];
            }
        }

        if (['Expenses', 'Revenue'].indexOf(kpi.code) !== -1) {
            switch (kpi.code) {
                case 'Expenses':
                    return ['expenses'];
                case 'Revenue':
                    return ['sales'];
            }
        }

        if (kpi.type === KPITypeEnum.Simple) {
            const expression = KPIExpressionHelper.DecomposeExpression(kpi.type, kpi.expression);
            return [expression.dataSource];
        }

        if (kpi.type === KPITypeEnum.Complex || kpi.type === KPITypeEnum.Compound) {
            // return sources from complex kpi
            return this._getComplexKpiExpressionSources(kpi.expression, kpis);
        }

        return [];
    }

    private  _getComplexKpiExpressionSources(expression: string, kpis: IKPIDocument[]): string[] {
        const regex = new RegExp(/kpi(\w+)/g); // I need to extract kpis from the expression
        let match: RegExpExecArray;
        const sources: string[] = [];

        while (match = regex.exec(expression)) {
            const a = expression;
            const kpiId = match[1];
            const kpi = kpis.find(k => k.id === kpiId);

            if (kpi) {
                const kpiSources = this._getKpiSources(kpi, kpis);
                kpiSources.forEach(s => {
                    if (sources.indexOf(s) === -1) {
                        sources.push(s);
                    }
                });
            }
        }

        return sources;
    }

    private _getCommonSourcePaths(sourceNames: string[], virtualSources: IVirtualSourceDocument[]): string[] {
        const sources = virtualSources.filter(v => sourceNames.indexOf(v.name.toLocaleLowerCase()) !== -1);
        const fieldPaths = sources.map(s => s.getGroupingFieldPaths());

        return intersection(...fieldPaths);
    }

    // GetGroupingsExistInCollectionSchema(schemaName: string): Promise<string[]> {
    //     const that = this;
    //     // get sales and expense mongoose models
    //     const model: IGroupingsModel = {
    //         sales: this._saleModel.model,
    //         expenses: this._expenseModel.model,
    //         inventory: this._inventoryModel.model
    //     };
    //     // get sales or expense mongoose models
    //     const gMap: string = codeMapper[schemaName];
    //     const collection = GroupingMap[gMap];
    //     const modelKey: string = codeMapper[schemaName];

    //     let permittedFields: string[] = [];
    //     const collectionQuery = [];

    //     return new Promise<string[]>((resolve, reject) => {
    //         // prop: i.e. 'location', 'concept', 'customerName'
    //         Object.keys(collection).forEach(prop => {
    //             const field = collection[prop];

    //             collectionQuery.push(model[modelKey].aggregate([{
    //                 $match: {
    //                     [field]: { $exists: true}
    //                 }
    //             }, {
    //                 $project: {
    //                     _id: 0,
    //                     [prop]: field
    //                 }
    //             }, {
    //                 $limit: 1
    //             }]));
    //         });

    //         Promise.all(collectionQuery).then(fieldExist => {
    //             // array of arrays with objects
    //             if (fieldExist) {
    //                 // convert to single object
    //                 const formatToObject = this._getObjects(fieldExist);
    //                 // get the keys from the formatToObject
    //                 permittedFields = Object.keys(formatToObject);
    //                 return resolve(sortBy(permittedFields));
    //             }
    //         });
    //     });
    // }

    private _kpiInUseByModel(id: string): Promise<IDocumentExist> {
        const that = this;

        return new Promise<IDocumentExist>((resolve, reject) => {
            // reject if no id is provided
            if (!id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Chart not found']} ] });
            }

            // query to find if kpi is in use by chart, widget, or complexkpi
            const findCharts: DocumentQuery<IChartDocument[], IChartDocument> = this._chart.model.find({
                kpis: { $in: [id] }
            });
            const findWidgets: DocumentQuery<IWidgetDocument[], IWidgetDocument> = this._widget.model.find({
                'numericWidgetAttributes.kpi': id
            });

            // contain regex expression to use for complex kpi
            const expression: RegExp = new RegExp(id);
            const findComplexKpi: DocumentQuery<IKPIDocument[], IKPIDocument> = this._kpis.model.find({
                expression: {
                    $regex: expression
                }
            });

            let documentExists: IDocumentExist = {};

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