import { DataSourceField } from './../app_modules/data-sources/data-sources.types';
import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { cloneDeep, intersectionBy, isArray, isDate, isEmpty, isObject, isString, pickBy, uniqBy } from 'lodash';
import * as moment from 'moment';
import { DocumentQuery } from 'mongoose';

import { KpiGroupingsInput } from '../app_modules/kpis/kpis.types';
import { ChartDateRangeInput } from '../app_modules/shared/shared.types';
import { IChartDocument } from '../domain/app/charts/chart';
import { Charts } from '../domain/app/charts/chart.model';
import { IExpenseModel } from '../domain/app/expenses/expense';
import { IInventoryModel } from '../domain/app/inventory/inventory';
import { IDocumentExist, IKPI, IKPIDocument, IKPIFilter, KPITypeEnum, KPITypeMap } from '../domain/app/kpis/kpi';
import { KPIExpressionHelper } from '../domain/app/kpis/kpi-expression.helper';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { ISaleModel } from '../domain/app/sales/sale';
import { IVirtualSourceDocument } from '../domain/app/virtual-sources/virtual-source';
import { VirtualSources, mapDataSourceFields } from '../domain/app/virtual-sources/virtual-source.model';
import { IWidgetDocument } from '../domain/app/widgets/widget';
import { Widgets } from '../domain/app/widgets/widget.model';
import { parsePredifinedDate } from '../domain/common/date-range';
import { blackListDataSource, getFieldsWithData, IFieldsWithDataDatePipeline } from '../domain/common/fields-with-data';
import { IValueName } from '../domain/common/value-name';
import { IConnectorDocument } from '../domain/master/connectors/connector';
import { Connectors } from '../domain/master/connectors/connector.model';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { DataSourcesService } from './data-sources.service';

export interface IGroupingsModel {
    sales: ISaleModel;
    expenses: IExpenseModel;
    inventory: IInventoryModel;
}

@injectable()
export class KpiService {
    private replacementString = [
        { key: '__dot__', value: '.' },
        { key: '__dollar__', value: '$' }
    ];

    constructor(
        @inject(KPIs.name) private _kpis: KPIs,
        @inject(Charts.name) private _chart: Charts,
        @inject(Widgets.name) private _widget: Widgets,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(DataSourcesService.name) private _dataSourcesService: DataSourcesService
    ) {}

    async getKpis(): Promise<IKPIDocument[]> {
        const kpis = await this._kpis.model.find({});
        const virtualSources = await this._virtualSources.model.find({});
        const connectors = await this._connectors.model.find({});

        // process available groupings
        const kpiList = await Bluebird.map(kpis, async (k) => {
            const kpiSources: string[] = this._getKpiSources(k, kpis, connectors);
            // find common field paths on the sources
            const groupingInfo = await this._getCommonSourcePaths(kpiSources, virtualSources);
            k.groupingInfo = groupingInfo || [];

            return k;
        });

        return kpiList;
    }

    async getKpi(id: string): Promise<IKPIDocument> {
        const doc = await this._kpis.model.findOne({ _id: id });
        doc.expression = KPIExpressionHelper.PrepareExpressionField(doc.type, doc.expression);

        return doc;
    }

    async getGroupingsWithData(input: KpiGroupingsInput): Promise<IValueName[]> {
        try {
            const allKpis: IKPIDocument[] = await this._kpis.model.find({});
            const cloneKpis: IKPIDocument[] = cloneDeep(allKpis);
            const kpi: IKPIDocument = cloneKpis.find((k: IKPIDocument) => k.id === input.id);

            const connectors: IConnectorDocument[] = await this._connectors.model.find({});

            const vs: IVirtualSourceDocument[] = await this._virtualSources.model.find({});
            const kpiSources: string[] = this._getKpiSources(kpi, allKpis, connectors);
            const sources: IVirtualSourceDocument[] = vs.filter((v: IVirtualSourceDocument) => {
                return kpiSources.indexOf(v.name.toLocaleLowerCase()) !== -1;
            });

            const kpiFilter = this._cleanFilter(kpi.filter || {});

            return await this._groupingsWithData(sources, input.dateRange, kpiFilter);
        } catch (err) {
            console.error('error getting grouping data', err);
            return [];
        }
    }

    async createKpi(input: IKPI): Promise<IKPIDocument> {
        const kpiType = KPITypeMap[input.type];
        const virtualSources = await this._virtualSources.model.find({});

        if (input.filter) {
            input.filter = KPIFilterHelper.ComposeFilter(kpiType, virtualSources, input.expression, input.filter);
        }

        delete(input.source);

        if (kpiType === KPITypeEnum.Simple || KPITypeEnum.ExternalSource) {
            input.expression = KPIExpressionHelper.ComposeExpression(kpiType, input.expression);
        }

        return await this._kpis.model.createKPI(input);
    }

    async updateKpi(id: string, input: IKPI): Promise<IKPIDocument> {
        const kpiType = KPITypeMap[input.type];
        const virtualSources = await this._virtualSources.model.find({});

        input.filter = KPIFilterHelper.ComposeFilter(kpiType, virtualSources, input.expression, input.filter);

        delete(input.source);

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

    getDateRange(chartDateRange: ChartDateRangeInput[]): any[] {
        return (Array.isArray(chartDateRange) && chartDateRange.length) ?
            chartDateRange.map(d => {
                const dateRange = this.processChartDateRange(d);

                return {
                    '$gte': dateRange.from,
                    '$lt': dateRange.to
                };
            }) : [];
    }

    processChartDateRange(chartDateRange: ChartDateRangeInput): any {
        return chartDateRange.custom && chartDateRange.custom.from ?
                {
                    from: moment(chartDateRange.custom.from).startOf('day').toDate(),
                    to: moment(chartDateRange.custom.to).endOf('day').toDate()
                }
                : parsePredifinedDate(chartDateRange.predefined);
    }

    private _getKpiSources(kpi: IKPIDocument, kpis: IKPIDocument[], connectors: IConnectorDocument[]): string[] {
    
        if (kpi.type === KPITypeEnum.ExternalSource) {
            const expression = KPIExpressionHelper.DecomposeExpression(kpi.type, kpi.expression);
            const sourceTokens = expression.dataSource.split('$');

            if (sourceTokens.length < 2) {
                console.warn(`External id: ${expression.dataSource} it is not well formed`);
                return [];
            }

            const connectorId = sourceTokens[1];
            const externalSource = connectors.find(c => c.id === connectorId);

            if (!externalSource) {
                console.error(`External source ${connectorId} not found`);
                return [];
            }

            return [externalSource.virtualSource];
        }

        if (kpi.type === KPITypeEnum.Simple || kpi.type === KPITypeEnum.ExternalSource) {
            const expression = KPIExpressionHelper.DecomposeExpression(kpi.type, kpi.expression);
            return [expression.dataSource];
        }

        if (kpi.type === KPITypeEnum.Complex || kpi.type === KPITypeEnum.Compound) {
            // return sources from complex kpi
            return this._getComplexKpiExpressionSources(kpi.expression, kpis, connectors);
        }

        return [];
    }

    private  _getComplexKpiExpressionSources(expression: string, kpis: IKPIDocument[], connectors: IConnectorDocument[]): string[] {
        const regex = new RegExp(/kpi(\w+)/g); // I need to extract kpis from the expression
        let match: RegExpExecArray;
        const sources: string[] = [];

        while (match = regex.exec(expression)) {
            const a = expression;
            const kpiId = match[1];
            const kpi = kpis.find(k => k.id === kpiId);

            if (kpi) {
                const kpiSources = this._getKpiSources(kpi, kpis, connectors);
                kpiSources.forEach(s => {
                    if (sources.indexOf(s) === -1) {
                        sources.push(s);
                    }
                });
            }
        }

        return sources;
    }

    private async _getCommonSourcePaths(sourceNames: string[], virtualSources: IVirtualSourceDocument[]): Promise<IValueName[]> {
        try {
            const sources = virtualSources.filter(v => sourceNames.indexOf(v.name.toLocaleLowerCase()) !== -1);
            const fieldPaths = sources.map(s => s.getGroupingFieldPaths());
            const commonFields = [];
            let fieldsWithData: string[];

            if (!fieldPaths.length) {
                return [];
            }

            if (fieldPaths.length === 1) {
                return fieldPaths[0];
            }

            fieldPaths[0].forEach(f => {
                let findCount = 1;

                for (let i = 1; i < fieldPaths.length; i++) {
                    const pathFound = fieldPaths[i].find(field => field.value === f.value);

                    if (pathFound) {
                        findCount += 1;
                        continue;
                    }
                }

                if (findCount === fieldPaths.length) {
                    commonFields.push(f);
                }
            });

            return commonFields;
        } catch (err) {
            console.error('error getting common source paths', err);
            return [];
        }
    }

    private async _fieldsWithDataOld(sources: IVirtualSourceDocument[], fields: IValueName[], dateRange: ChartDateRangeInput[], kpiFilterSource?: IKPIFilter[], kpiFilter?: any): Promise<IValueName[]> {
        try {
            const existingFields: IValueName[][] = await Bluebird.map(sources, async (source: IVirtualSourceDocument) => {
                if (blackListDataSource.indexOf(source.source) !== -1) {
                    return fields;
                }

                let aggregate = [];
                if (source.aggregate) {
                    aggregate = source.aggregate.map(a => {
                        return KPIFilterHelper.CleanObjectKeys(a);
                    });
                }

                let kpiDateRange: IFieldsWithDataDatePipeline;

                if (source.dateField) {
                    const timestampField = source.dateField;
                    kpiDateRange = { timestampField: timestampField, dateRange: this.getDateRange(dateRange) };
                } else {
                    kpiDateRange = { timestampField: null, dateRange: null };
                }

                const collectionSource: string[] = this._getCollectionSource(kpiFilterSource);
                const filter = pickBy(kpiFilter, (item, k) => k !== 'source');

                const fieldsWithData: string[] =
                    await getFieldsWithData(
                        source,
                        fields,
                        collectionSource,
                        aggregate,
                        kpiDateRange,
                        filter
                    );

                return fields.filter(field => {
                    return fieldsWithData.indexOf(field.name) !== -1 ||
                           fieldsWithData.indexOf(field.value) !== -1;
                });
            });

            if (!existingFields) {
                return [];
            }

            if (existingFields.length === 1) {
                return existingFields[0];
            }

            let commonFields = [];
            existingFields.forEach((f: IValueName[]) => {
                commonFields = intersectionBy(f, f, 'name');
            });

            return commonFields;
        } catch (e) {
            throw new Error('error getting fields with data');
        }
    }

    private async _groupingsWithData(virtualSources: IVirtualSourceDocument[], dateRange: ChartDateRangeInput[],
                                     kpiFilter?: any): Promise<IValueName[]> {
        try {
            const existingGroupings: Array<IValueName[]> =
                await Bluebird.map(
                    virtualSources,
                    async (vs: IVirtualSourceDocument) =>
                        this._getAvailableGroupingForOptions(
                            vs, dateRange, kpiFilter
                        )
                );

            if (!existingGroupings) {
                return [];
            }

            if (existingGroupings.length === 1) {
                return existingGroupings[0];
            }

            const uniqList =
               uniqBy([].concat(...existingGroupings), 'value');

            const commonGroupings = existingGroupings.reduce(
                (acc, arr) => intersectionBy(acc, arr, 'value'),
                uniqList
            );


            return commonGroupings;
        } catch (e) {
            throw new Error('error getting fields with data');
        }
    }

    private async _getAvailableGroupingForOptions(vs: IVirtualSourceDocument, dateRange: ChartDateRangeInput[],
                                                  filters: any): Promise<IValueName[]> {
        let availableFields: DataSourceField[];

        if (!vs.externalSource) {
            const dateRangeFilter = this._getDateRangeAsFilter(dateRange);

            availableFields = await this._dataSourcesService.getAvailableFields(
                vs,
                [],
                { dateRangeFilter, filters, excludeSourceField: false }
            );
        } else {
            availableFields = mapDataSourceFields(vs, false);
            availableFields.forEach(f => f.available = true);
        }

        const availableGroupings =
            availableFields
                .filter(f => f.available && f.allowGrouping)
                .map(f => { return { name: f.name, value: f.path}; });

        return availableGroupings;
    }

    private _getCollectionSource(kpiFilter: IKPIFilter[]): string [] {
        if (!Array.isArray(kpiFilter) || isEmpty(kpiFilter)) {
            return [];
        }

        const cloneKpiFilter: IKPIFilter[] = cloneDeep(kpiFilter);

        const source: IKPIFilter = cloneKpiFilter.find(k => k.field === 'source');
        if (!source) {
            return [];
        }

        return source.criteria.split('|');
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

            Bluebird.all([findCharts, findWidgets, findComplexKpi])
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

    private _cleanFilter(filter: any): any {
        let newFilter = {};

        if (isString(filter)) {
            return filter;
        }

        Object.keys(filter).forEach(filterKey => {

            let key = filterKey;
            this.replacementString.forEach(r => key = key.replace(r.key, r.value));
            let value = filter[filterKey];

            if (!isArray(value) && !isDate(value) && isObject(value)) {
                newFilter[key] = this._cleanFilter(value);
            } else if (!isDate(value) && isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this._cleanFilter(value[i]);
                }
                newFilter[key] = value;
            } else {
                // apply filter
                let filterValue = filter[filterKey];
                const operatorName = filterKey.replace(/__dot__|__dollar__|\$/g, '');

                if (this._isRegExpOperator(operatorName)) {
                    // process filter value
                    if (operatorName.indexOf('start') !== -1) {
                        filterValue = '^' + filterValue;
                    }

                    if (operatorName.indexOf('end') !== -1) {
                        filterValue = filterValue + '$';
                    }

                    key = '$regex';
                    if (operatorName === 'regex') {
                        value = new RegExp(filterValue);
                    } else {
                        value = new RegExp(filterValue, 'i');
                    }
                } else {
                    value = filterValue;
                }

                newFilter[key] = value;
            }
        });

        return newFilter;
    }

    private _isRegExpOperator(operator: string): boolean {
        const regexStrings = ['startWith', 'endWith', 'contains', 'regex'];

        return regexStrings.indexOf(operator) !== -1;
    }

    private _getDateRangeAsFilter(dr: ChartDateRangeInput[]): any {
        // if it is an array let's get the first element
        const drFilter = this.getDateRange(dr);
        return Array.isArray(drFilter) ? drFilter[0] : drFilter;
    }
}