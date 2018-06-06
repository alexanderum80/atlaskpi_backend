import { IVirtualSourceDocument } from '../domain/app/virtual-sources/virtual-source';
import { DataSourceField, DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import {VirtualSources, mapDataSourceFields} from '../domain/app/virtual-sources/virtual-source.model';
import {sortBy} from 'lodash';
import { Logger } from '../domain/app/logger';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import * as Bluebird from 'bluebird';
import { isObject, isEmpty } from 'lodash';
import {KPIExpressionFieldInput} from '../app_modules/kpis/kpis.types';
import {getFieldsWithData} from '../domain/common/fields-with-data';

const COLLECTION_SOURCE_MAX_LIMIT = 20;
const COLLECTION_SOURCE_FIELD_NAME = 'source';
const GOOGLE_ANALYTICS = 'GoogleAnalytics';

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
                                    async (virtualSource: DataSourceResponse) => await this.getCollectionSource(virtualSource), {
                                        concurrency: 1
                                    });
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
        virtualSource.fields = await this.filterFieldsWithoutData(virtualSource);
        return virtualSource;
    }

    /**
     * i.e. dataSource = 'established_customers_sales'
     * @param data
     */
    async getKPIFilterFieldsWithData(dataSource: string, collectionSource: string[], fields: DataSourceField[]): Promise<DataSourceField[]> {
        if (!dataSource) {
            return [];
        }

        const virtualSource = await this._virtualDatasources.model.findOne({ name: { $regex: new RegExp(dataSource, 'i')} });
        const fieldsWithData: string[] = await getFieldsWithData(this._container, virtualSource.source, fields, collectionSource);

        fields.forEach((f: DataSourceField) => {
            f.available = fieldsWithData.indexOf(f.name) !== -1;
        });

        return fields;
    }

    async getDistinctValues(name: string, source: string, field: string, limit: number, filter: string): Promise<string[]> {
        try {
            const vs = await this._virtualDatasources.model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }  });
            if (this._isGoogleAnalytics(vs.source)) {
                return [];
            }

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

    async getExpressionFieldsWithData(input: KPIExpressionFieldInput): Promise<DataSourceField[]> {
        // i.e. 'nextech'
        const collectionSource: string[] = input.collectionSource;
        // i.e. 'established_customer'
        const dataSource: string = input.dataSource;
        const virtualSource: IVirtualSourceDocument = await this._virtualDatasources.model.getDataSourceByName(dataSource);

        const expressionFields: DataSourceField[] = mapDataSourceFields(virtualSource);
        if (this._isGoogleAnalytics(virtualSource.source)) {
            return this._getGoogleAnalyticsFields(expressionFields);
        }


        const fieldsWithData: string[] = await getFieldsWithData(this._container, virtualSource.source, expressionFields, collectionSource);

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
            let sources: string[] = await getFieldsWithData(this._container, dataSource, fields, collectionSource, aggregate) || [];
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

    private _isGoogleAnalytics(dataSource: string): boolean {
        return dataSource === GOOGLE_ANALYTICS;
    }

    private _getGoogleAnalyticsFields(fields: DataSourceField[]): DataSourceField[] {
        fields.forEach(f => {
            f.available = true;
        });

        return fields;
    }
}