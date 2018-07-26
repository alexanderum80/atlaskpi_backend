import { name } from 'aws-sdk/clients/importexport';
import { camelCase } from 'change-case';
import { IVirtualSourceDocument } from '../domain/app/virtual-sources/virtual-source';
import { DataSourceField, DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import {VirtualSources, mapDataSourceFields} from '../domain/app/virtual-sources/virtual-source.model';
import { sortBy, concat } from 'lodash';
import { Logger } from '../domain/app/logger';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import * as Bluebird from 'bluebird';
import { isObject, isEmpty } from 'lodash';
import {KPIExpressionFieldInput} from '../app_modules/kpis/kpis.types';
import {getFieldsWithData} from '../domain/common/fields-with-data';
import { criteriaPlugin } from '../app_modules/shared/criteria.plugin';
import * as mongoose from 'mongoose';
import { AppConnection } from '../domain/app/app.connection';
import * as moment from 'moment';

const COLLECTION_SOURCE_MAX_LIMIT = 20;
const COLLECTION_SOURCE_FIELD_NAME = 'source';
const GOOGLE_ANALYTICS = 'GoogleAnalytics';

@injectable()
export class DataSourcesService {

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject('resolver') private _resolver: (name: string) => any,
        @inject(AppConnection.name) private _appConnection: AppConnection,
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
        const model = this._resolver(virtualSource.source).model;
        const fieldsWithData: string[] = await getFieldsWithData(model, fields, collectionSource);

        fields.forEach((f: DataSourceField) => {
            f.available = fieldsWithData.indexOf(f.name) !== -1;
        });

        return fields;
    }

    async getDistinctValues(name: string, source: string, field: string, limit: number, filter: string): Promise<string[]> {
        try {
            const vs = await this._virtualDatasources.model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }  });
            const schema = new mongoose.Schema({}, { strict: false });
            schema.plugin(criteriaPlugin);

            const connection: mongoose.Connection = this._appConnection.get;
            let model;
            model = <any>connection.model(source, schema, source.toLowerCase());

            if (!model || !model.findCriteria) {
                return [];
            }

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
        const model = this._resolver(virtualSource.source).model;

        const expressionFields: DataSourceField[] = mapDataSourceFields(virtualSource);
        if (this._isGoogleAnalytics(virtualSource.source)) {
            return this._getGoogleAnalyticsFields(expressionFields);
        }


        const fieldsWithData: string[] = await getFieldsWithData(model, expressionFields, collectionSource);

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
            const schema = new mongoose.Schema({}, { strict: false });
            schema.plugin(criteriaPlugin);

            const connection: mongoose.Connection = this._appConnection.get;
            let model;
            model = <any>connection.model(dataSource, schema, dataSource.toLowerCase());

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

    createVirtualSourceMapCollection(data) {
        const schema = new mongoose.Schema({}, { strict: false });

        const dataCollection = <any>data.input.records;
        const schemaCollection = data.input.fields;

        dataCollection.map(d => {
            const collection: any[] = [];
            for (let i = 0; i < d.length; i++) {
                const record = d[i];
                const fieldName = schemaCollection[i].columnName;
                collection[fieldName] = record;
            }
            collection['source'] = 'Manual entry';
            collection['timestamp'] = moment.utc().toDate();

            const connection: mongoose.Connection = this._appConnection.get;
            const newCollection = <any>connection.model(camelCase(data.input.inputName), schema);
            const model = new newCollection(collection);
            model.save();
        });
    }

    getVirtualSourceMapCollection(name) {
        try {
            this._virtualDatasources.model.getDataSourceByName(name)
                .then(dataSource => {
                    if (!dataSource) {
                        return null;
                    }
                    const dataCollection = dataSource.source;

                    const schema = new mongoose.Schema({}, { strict: false });

                    const connection: mongoose.Connection = this._appConnection.get;
                    const model = connection.model(dataCollection, schema, dataCollection);
                    const dataModel = model.find().then(modelData => {
                        return JSON.stringify(modelData.map(data => {
                            data['_doc'];
                        }));
                    });
                });
        } catch (err) {
            console.log('error getting virtual source collection: ' + err);
        }
    }

    removeVirtualSourceMapCollection(source) {
        const connection: mongoose.Connection = this._appConnection.get;
        connection.db.dropCollection(source);
    }
}