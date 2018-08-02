import { IDateRange } from './../domain/common/date-range';
import { IVirtualSourceDocument, IVirtualSource } from '../domain/app/virtual-sources/virtual-source';
import { DataSourceField, DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import {VirtualSources, mapDataSourceFields} from '../domain/app/virtual-sources/virtual-source.model';
import {sortBy} from 'lodash';
import { Logger } from '../domain/app/logger';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import * as Bluebird from 'bluebird';
import { isObject, isEmpty } from 'lodash';
import {KPIExpressionFieldInput} from '../app_modules/kpis/kpis.types';
import {getFieldsWithData, getGenericModel, getAggregateResult} from '../domain/common/fields-with-data';
import { ICriteriaSearchable } from '../app_modules/shared/criteria.plugin';

const GOOGLE_ANALYTICS = 'GoogleAnalytics';

export interface IFieldAvailabilityOptions {
    dateRangeFilter?: { $gte: Date, $lt: Date };
    filters?: any;
    excludeSourceField?: boolean;
}

@injectable()
export class DataSourcesService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject('resolver') private _resolver: (name: string) => any,
        @inject(VirtualSources.name) private _virtualDatasources: VirtualSources) { }

    async get(): Promise<DataSourceResponse[]> {
        return await this._virtualDatasources.model.getDataSources();
        // const dataSources = await this._virtualDatasources.model.getDataSources();

        // await Bluebird.map(
        //     dataSources,
        //     async(ds: DataSourceResponse) => {
        //         const vs: IVirtualSourceDocument = await this._virtualDatasources.model.getDataSourceByName(ds.name);
        //         ds.fields = await this.getAvailableFields(vs, []);
        //     },
        //     { concurrency: 10 }
        // );

        // return dataSources;
        // virtualDataSources = await Bluebird.map(
        //     virtualDataSources,
        //     async (vs: DataSourceResponse) => await this.getCollectionSource(vs),
        //     { concurrency: 10 });
        // return sortBy(virtualDataSources, 'name');
    }

    /**
     * i.e. dataSource = 'established_customers_sales'
     * @param data
     */
    async getKPIFilterFieldsWithDataOld(dataSource: string, collectionSource?: string[], fields?: DataSourceField[]): Promise<DataSourceField[]> {
        if (!dataSource) {
            return [];
        }

        const vs = await this._virtualDatasources.model.findOne({
            name: { $regex: new RegExp(dataSource, 'i')}
        });

        if (!fields) {
            fields = mapDataSourceFields(vs);
        }

        if (vs.externalSource) {
            fields.forEach(f => f.available = true);
            return fields;
        }

        const fieldsWithData: string[] = await getFieldsWithData(vs, fields, collectionSource);

        fields.forEach((f: DataSourceField) => {
            f.available = fieldsWithData.indexOf(f.name) !== -1;
        });

        return fields;
    }

    async getDistinctValues(name: string, source: string, field: string, limit: number, filter: string, collectionSource?: string[]): Promise<string[]> {
        try {
            const vs = await this._virtualDatasources.model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }  });
            return await vs.getDistinctValues(vs, field, limit, filter, collectionSource);
        } catch (e) {
            this._logger.error('There was an error retrieving the distinct values', e);
            return [];
        }
    }

    async getExpressionFieldsWithData(input: KPIExpressionFieldInput): Promise<DataSourceField[]> {
        const dataSource: string = input.dataSource;
        const virtualSource: IVirtualSourceDocument = await this._virtualDatasources.model.getDataSourceByName(dataSource);

        let expressionFields: DataSourceField[];

        if (virtualSource.externalSource) {
            expressionFields = mapDataSourceFields(virtualSource);
            expressionFields.forEach(f => f.available = true);
        } else {
            expressionFields = await this.getAvailableFields(virtualSource, input.collectionSource);
        }

        return expressionFields;
    }

    async getExpressionFieldsWithDataOld(input: KPIExpressionFieldInput): Promise<DataSourceField[]> {
        // i.e. 'nextech'
        const collectionSource: string[] = input.collectionSource;
        // i.e. 'established_customer'
        const dataSource: string = input.dataSource;
        const virtualSource: IVirtualSourceDocument = await this._virtualDatasources.model.getDataSourceByName(dataSource);
        // const model = this._resolver(virtualSource.modelIdentifier).model;

        const expressionFields: DataSourceField[] = mapDataSourceFields(virtualSource);

        if (this._isGoogleAnalytics(virtualSource.source)) {
            return this._getGoogleAnalyticsFields(expressionFields);
        }

        const fieldsWithData: string[] = await getFieldsWithData(virtualSource, expressionFields, collectionSource);

        expressionFields.forEach((n: DataSourceField) => {
            n.available = fieldsWithData.indexOf(n.name) !== -1;
        });

        return expressionFields;
    }

    async filterFieldsWithoutData(virtualSource: DataSourceResponse, collectionSource?: string[]): Promise<DataSourceField[]> {
        try {
            const fields: DataSourceField[] = virtualSource.fields;
            // i.e. Sales
            const dataSource: string = virtualSource.dataSource;
            const model = this._resolver(dataSource).model;

            if (this._isGoogleAnalytics(dataSource)) {
                return this._getGoogleAnalyticsFields(fields);
            }

            const name = virtualSource.name;
            const vs = await this._virtualDatasources.model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }  });
            let aggregate = [];
            if (vs.aggregate) {
                aggregate = vs.aggregate.map(a => {
                    return KPIFilterHelper.CleanObjectKeys(a);
                });
            }

            // i.e ['APS Nextech ( nextech )']
            let sources: string[] = await getFieldsWithData(model, fields, collectionSource, aggregate);
            sources = sources.map(s => s.toLowerCase());


            virtualSource.fields.forEach((f: DataSourceField) => {
                f.available = isEmpty(sources) ? false :
                              (sources.indexOf(f.name.toLowerCase()) !== -1 || sources.indexOf(f.path.toLowerCase()) !== -1);
            });
            return virtualSource.fields;
        } catch (err) {
            console.error('error filtering fields without data', err);
            return [];
        }
    }

    private async _getDataSourceFields(vs: IVirtualSourceDocument, fields: DataSourceField[], collectionSource: string[]): Promise<DataSourceField[]> {
        if (this._isGoogleAnalytics(vs.source)) {
            return this._getGoogleAnalyticsFields(fields);
        }

        let aggregate = [];
        if (vs.aggregate) {
            aggregate = vs.aggregate.map(a => {
                return KPIFilterHelper.CleanObjectKeys(a);
            });
        }

        const model = this._resolver(vs.source).model;
        const fieldsWithData: string[] = await getFieldsWithData(model, fields, collectionSource, aggregate);
        fields.forEach((n: DataSourceField) => {
            n.available = fieldsWithData.indexOf(n.name) !== -1;
        });

        return fields;
    }

    private _isGoogleAnalytics(dataSource: string): boolean {
        return dataSource === GOOGLE_ANALYTICS;
    }

    private _getGoogleAnalyticsFields(fields: DataSourceField[]): DataSourceField[] {
        fields.forEach(f => {
            f.available = true;
        });

        return fields;
    }

    /**
    // To get the availability of the fields we are going to use the following mehthod/aggegation stage
    // to count the number of records with value in each field
    //
    //
    // Stage:
    // { $group: {
    //     "_id" : null,
    //     "customer": { $sum: {$cond: [{$gte: ['$customer', null]}, 1, 0] } },
    //     "field_no_value": {
    //          $sum: {
    //              $cond: [ {
    //                  '$and': [
    //                		 {'$gte': ['$field_no_value', null] },
    //                		 {'$ne': ['$field_no_value', null]  }
    //                  ]
    //              } ]
    //          }
    // }
    //
    // Output:
    // {
    //     "_id" : null,
    //     "customer" : 544.0,
    //     "field_no_value" : 0.0
    // }
    */
    async getAvailableFields(vs: IVirtualSourceDocument, sourceFieldCriterias: string[],
                             options: IFieldAvailabilityOptions = {}): Promise<DataSourceField[]> {
        if (!vs) return [];

        const { dateRangeFilter, filters, excludeSourceField } = options;

        const aggregate = [];

        const fields =
            Object.keys(vs.fieldsMap)
                  .map(k => { return { name: k, value: vs.fieldsMap[k].path }; });

        // construct match stage
        if (sourceFieldCriterias && sourceFieldCriterias.length) {
            const match = { $match : { source: { $in: sourceFieldCriterias } } };
            aggregate.push(match);
        }

        // original aggregate
        if (vs.aggregate) {
            const originalAgg =
                (vs.toObject() as IVirtualSource)
                    .aggregate
                    .map(stage => KPIFilterHelper.CleanObjectKeys(stage));
            aggregate.push(...originalAgg);
        }

        // after original aggregate stage
        const afterMatch = { $match: { } };

        // if daterange add it to a match stage after the original aggregate
        // this could be optimiezed to detect if the daterange field goes before of after the original aggregate
        if (dateRangeFilter && dateRangeFilter) {
            afterMatch.$match[vs.dateField] = dateRangeFilter;
        }

        // if daterange add it to a match stage after the original aggregate
        if (filters) {
            afterMatch.$match =  Object.assign(afterMatch.$match, filters);
        }

        // add the stage to the pipeline
        if (filters || dateRangeFilter) {
            aggregate.push(afterMatch);
        }

        // construct the stage for getting value-existance of the fields
        const existanceStage = { $group: { '_id' : null } };
        fields.forEach(f =>
            existanceStage.$group[f.name] = {
                $sum: {
                    $cond: [
                        {
                            // $gte: [`$${f.value}`, null]
                            $and: [
                                { $gte: [`$${f.value}`, null] },
                                { $ne:  [`$${f.value}`, null] }
                            ]
                        }
                        , 1, 0
                    ]
                }
            }
        );
        aggregate.push(existanceStage);

        // execute the new aggregate
        const aggResult = await getAggregateResult(vs, aggregate) as any[];
        // console.dir(aggResult);

        const expresionFields = mapDataSourceFields(vs, excludeSourceField);

        // set availablee fields with value gt 0
        expresionFields.forEach(f => {
            f.available  = (aggResult[0] || {})[f.name] > 0 ? true : false;
        });

        return expresionFields;
    }

    async getKPIFilterFieldsWithData(dataSource: string, collectionSource?: string[], fields?: DataSourceField[]): Promise<DataSourceField[]> {
        if (!dataSource) {
            return [];
        }

        const vs = await this._virtualDatasources.model.findOne({
            name: { $regex: new RegExp(dataSource, 'i')}
        });

        if (!fields) {
            fields = mapDataSourceFields(vs);
        }

        if (vs.externalSource) {
            fields.forEach(f => f.available = true);
            return fields;
        }

        const fieldsWithData: string[] = await getFieldsWithData(vs, fields, collectionSource);

        fields.forEach((f: DataSourceField) => {
            f.available = fieldsWithData.indexOf(f.name) !== -1;
        });

        return fields;
    }
}