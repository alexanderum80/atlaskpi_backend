import { IVirtualSourceDocument } from '../domain/app/virtual-sources/virtual-source';
import { DataSourceField, DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import { VirtualSources } from '../domain/app/virtual-sources/virtual-source.model';
import { sortBy } from 'lodash';
import { Logger } from '../domain/app/logger';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import * as Bluebird from 'bluebird';
import { isObject, isEmpty } from 'lodash';
import {KPIExpressionFieldInput} from '../app_modules/kpis/kpis.types';

const COLLECTION_SOURCE_MAX_LIMIT = 20;
const COLLECTION_SOURCE_FIELD_NAME = 'source';

@injectable()
export class DataSourcesService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject(Container.name) private _container: Container,
        @inject(VirtualSources.name) private _virtualDatasources: VirtualSources) { }

    async get(): Promise<DataSourceResponse[]> {
        let virtualSources = await this._virtualDatasources.model.getDataSources();
        virtualSources = await Bluebird.map(
                                    virtualSources,
                                    (virtualSource: DataSourceResponse) => this.getCollectionSource(virtualSource));
        return sortBy(virtualSources, 'name');
    }

    async getCollectionSource(virtualSource: DataSourceResponse): Promise<DataSourceResponse> {
        const filter = '';
        const distinctValues: string[] = await this.getDistinctValues(
            virtualSource.name,
            virtualSource.dataSource,
            COLLECTION_SOURCE_FIELD_NAME,
            COLLECTION_SOURCE_MAX_LIMIT,
            filter
        );

        virtualSource.sources = distinctValues;
        return virtualSource;
    }

    /**
     * i.e. dataSource = 'established_customers_sales'
     * @param data
     */
    async getKPIFilterFieldsWithData(dataSource: string, collectionSource: string[], fields: DataSourceField[]): Promise<DataSourceField[]> {
        if (!dataSource && !collectionSource) {
            return [];
        }

        const virtualSource = await this._virtualDatasources.model.findOne({ name: { $regex: new RegExp(dataSource, 'i')} });
        const fieldsWithData: string[] = await this.getFieldsWithData(virtualSource.source, fields, collectionSource);

        fields.forEach((f: DataSourceField) => {
            f.available = fieldsWithData.indexOf(f.name) !== -1;
        });

        return fields;
    }

    async getDistinctValues(name: string, source: string, field: string, limit: number, filter: string): Promise<string[]> {
        try {
            const vs = await this._virtualDatasources.model.findOne({ name: { $regex: new RegExp(name, 'i') }  });
            const model = (this._container.get(source) as any).model;

            let aggregate = [];

            if (vs.aggregate) {
                aggregate = vs.aggregate.map(a => {
                    return KPIFilterHelper.CleanObjectKeys(a);
                });
            }

            return await (model as any).findCriteria(field, aggregate, limit, filter);
        } catch (e) {
            this._logger.error('There was an error retrieving the distinct values', e);
            return [];
        }
    }

    async getNumericFieldsWithData(input: KPIExpressionFieldInput): Promise<DataSourceField[]> {
        // i.e. 'nextech'
        const collectionSource: string[] = input.collectionSource;
        // i.e. 'established_customer'
        const dataSource: string = input.dataSource;
        const virtualSource: IVirtualSourceDocument = await this._virtualDatasources.model.getDataSourceByName(dataSource);

        const numericFields: DataSourceField[] = virtualSource
                                                .mapDataSourceFields(virtualSource)
                                                .filter((field: DataSourceField) => field.type === 'Number');

        const fieldsWithData: string[] = await this.getFieldsWithData(virtualSource.source, numericFields, collectionSource);

        numericFields.forEach((n: DataSourceField) => {
            n.available = fieldsWithData.indexOf(n.name) !== -1;
        });

        return numericFields;
    }

    async filterFieldsWithoutData(virtualSource: DataSourceResponse, collectionSource?: string[]): Promise<DataSourceField[]> {
        const fields: DataSourceField[] = virtualSource.fields;
        // i.e. Sales
        const dataSource: string = virtualSource.dataSource;

        // i.e ['APS Nextech ( nextech )']
        const sources: string[] = await this.getFieldsWithData(dataSource, fields, collectionSource);

        virtualSource.fields.forEach((f: DataSourceField) => {
            f.available = isEmpty(sources) || sources.indexOf(f.name) !== -1;
        });
        return virtualSource.fields;
    }

    async getFieldsWithData(dataSource: string, fields: DataSourceField[], collectionSource?: string[]): Promise<string[]> {
        const collectionQuery = [];
        const model = (this._container.get(dataSource) as any).model;
        let fieldsWithData: string[] = [];

        fields.forEach((field: DataSourceField) => {
            // referral.name
            const fieldPath: string = field.path;
            // i.e. Referral
            const fieldName: string = field.name;
            let matchStage = {
                $match: {
                    [fieldPath]: {
                        $nin: ['', null, 'null', 'undefined']
                    }
                }
            };

            if (Array.isArray(collectionSource) && collectionSource.length) {
                Object.assign(matchStage.$match, {
                    source: {
                        $in: collectionSource
                    }
                });
            }

            collectionQuery.push(
                model.aggregate([
                    matchStage
                    , {
                    $project: {
                        _id: 0,
                        // Referral: 'referral.name'
                        [fieldName]: fieldPath
                    }
                }, {
                    $limit: 1
                }])
            );
        });

        const fieldsExists: any[] = await Bluebird.all(collectionQuery);
        if (fieldsExists) {
            const formatToObject = this._transformToObject(fieldsExists);
            fieldsWithData = Object.keys(formatToObject);

            return fieldsWithData;
        }
        return fieldsWithData;
    }

    private _transformToObject(arr: any[]): any {
        if (!arr) { return; }
        const newObject = {};

        arr.forEach(singleArray => {
            if (singleArray && Array.isArray(singleArray)) {
                singleArray.forEach(obj => {
                    if (isObject(obj)) {
                        Object.assign(newObject, obj);
                    }
                });
            }
        });

        return newObject;
    }
}
