import { DataEntryByIdMapCollectionQuery } from './../app_modules/data-entry/queries/data-entry-by-id.query';
import { CustomList } from './../domain/app/custom-list/custom-list.model';
import { camelCase } from 'change-case';
import { IDateRange, isValidTimezone } from './../domain/common/date-range';
import { IVirtualSourceDocument, IVirtualSource } from '../domain/app/virtual-sources/virtual-source';
import { DataSourceField, DataSourceResponse } from '../app_modules/data-sources/data-sources.types';
import { injectable, inject, Container } from 'inversify';
import {VirtualSources, mapDataSourceFields} from '../domain/app/virtual-sources/virtual-source.model';
import { sortBy, concat, isBoolean } from 'lodash';
import { Logger } from '../domain/app/logger';
import { KPIFilterHelper } from '../domain/app/kpis/kpi-filter.helper';
import * as Bluebird from 'bluebird';
import { isObject, isEmpty, toInteger, toNumber } from 'lodash';
import {KPIExpressionFieldInput} from '../app_modules/kpis/kpis.types';
import {getFieldsWithData, getGenericModel, getAggregateResult} from '../domain/common/fields-with-data';
import { ICriteriaSearchable } from '../app_modules/shared/criteria.plugin';
import * as mongoose from 'mongoose';
import { AppConnection } from '../domain/app/app.connection';
import * as moment from 'moment';
import { IMutationResponse } from '../framework/mutations/mutation-response';
import { Connectors } from '../domain/master/connectors/connector.model';
import { CurrentUser } from '../domain/app/current-user';
import { VirtualSourceAggregateService, IKeyValues } from '../domain/app/virtual-sources/vs-aggregate.service';
import * as XLSX from 'ts-xlsx';
import { KPIs } from '../domain/app/kpis/kpi.model';
import { IKPIDocument } from '../domain/app/kpis/kpi';

const GOOGLE_ANALYTICS = 'GoogleAnalytics';
const csvTokenDelimeter = ',';

const Alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export interface IFieldAvailabilityOptions {
    dateRangeFilter?: { $gte: Date, $lt: Date };
    filters?: any;
    excludeSourceField?: boolean;
}

@injectable()
export class DataSourcesService {

    private timezone: string;

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject('resolver') private _resolver: (name: string) => any,
        @inject(AppConnection.name) private _appConnection: AppConnection,
        @inject(Connectors.name) private _connectors: Connectors,
        @inject(VirtualSources.name) private _virtualDatasources: VirtualSources,
        @inject(VirtualSourceAggregateService.name) private _vsAggregateService: VirtualSourceAggregateService,
        @inject(CustomList.name) private _customList: CustomList,
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(KPIs.name) private _kpis: KPIs
    ) {
        const tz = this._currentUser.get().profile.timezone;

        if (!isValidTimezone(tz)) throw new Error('Invalid user timezone');

        this.timezone = tz;
    }

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

    async getDataEntry(): Promise<DataSourceResponse[]> {
        const userId = this._currentUser.get().id;
        return await this._virtualDatasources.model.getDataEntry(userId);
    }

    async getDataEntryCollection(): Promise<any> {
        const userId = this._currentUser.get().id;
        const dataEntries = await this._virtualDatasources.model.getDataEntry(userId);

        if (dataEntries.length) {
            const dataEntriesCollection = [];
            for (let index = 0; index < dataEntries.length; index++) {
                const element = dataEntries[index];
                const dataEntry = await this.getVirtualSourceByIdMapCollection(element._id);
                dataEntriesCollection.push(JSON.parse(dataEntry));
            }
            return JSON.stringify(dataEntriesCollection);
        } else {
            return null;
        }
    }

    async getDataEntryById(id: string): Promise<IVirtualSourceDocument> {
        return await this._virtualDatasources.model.getDataSourceById(id);
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
            name: { $regex: new RegExp(`^${dataSource}$`, 'i')}
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
            return await vs.getDistinctValues(vs, field, limit, filter,  this._vsAggregateService, collectionSource);
        } catch (e) {
            this._logger.error('There was an error retrieving the distinct values', e);
            return [];
        }
    }

    async getExpressionFieldsWithData(input: KPIExpressionFieldInput): Promise<DataSourceField[]> {
        let expressionFields: DataSourceField[];

        const dataSource: string = input.dataSource;

        if (!dataSource) return expressionFields;

        let virtualSource: IVirtualSourceDocument = await this._virtualDatasources.model.getDataSourceByName(dataSource);

        if (!virtualSource) return expressionFields;

        if (virtualSource.externalSource) {
            expressionFields = mapDataSourceFields(virtualSource);
            expressionFields.forEach(f => f.available = true);
        } else {
            const vsAsObject = virtualSource.toObject() as IVirtualSource;

            virtualSource.aggregate = this._vsAggregateService.applyDateRangeReplacement(vsAsObject.aggregate);

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
            const schema = new mongoose.Schema({}, { strict: false });

            const connection: mongoose.Connection = this._appConnection.get;
            const model = <any>connection.model(dataSource, schema, camelCase(dataSource));

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

        // const model = this._resolver(vs.source).model;
        const schema = new mongoose.Schema({}, { strict: false });
        const connection: mongoose.Connection = this._appConnection.get;
        const model = <any>connection.model(vs.source, schema, vs.source.toLowerCase());

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

    async addDataSource(data): Promise<IVirtualSourceDocument> {
        if (!data) { return Promise.reject('cannot add a document with, empty payload'); }

        try {
            const user = this._currentUser.get().id;
            const customList = await this._customList.model.getCustomList(user);

            const fileExtensionIndex = data.inputName.lastIndexOf('.') !== -1 ? data.inputName.lastIndexOf('.') : data.inputName.length;

            const simpleName = data.inputName.substr(0, fileExtensionIndex);
            const collectionName = simpleName.substr(simpleName.length - 1, 1) !== 's'
                                ? camelCase(simpleName.concat('s')) : camelCase(simpleName);

            data.fields = JSON.parse(data.fields);
            let inputFieldsMap = {};
            inputFieldsMap['Source'] = {
                path: 'source',
                dataType: 'String',
                allowGrouping: true
            };

            for (let i = data.fields.length - 1; i >= 0; i--) {
                const f = data.fields[i];
                const field = f.columnName;
                let dataType = f.dataType;

                const sourceOrigin = customList.find(c => c.id === dataType);

                inputFieldsMap[field] = {
                    path: field.toLowerCase().replace(' ', '_'),
                    dataType: sourceOrigin ? sourceOrigin.dataType : dataType,
                    required: f.required || false
                };

                if (sourceOrigin) {
                    inputFieldsMap[field].sourceOrigin = sourceOrigin.id;
                }

                if (dataType === 'String') {
                    inputFieldsMap[field].allowGrouping = true;
                }
            }

            const virtualSourceObj: IVirtualSource = {
                name: camelCase(simpleName).toLowerCase(),
                description: data.inputName,
                source: collectionName,
                modelIdentifier: collectionName,
                dateField: data.dateRangeField.toLowerCase().replace(' ', '_'),
                aggregate: [],
                fieldsMap: inputFieldsMap,
                dataEntry: true,
                users: data.users,
                createdBy: user
            };
            return new Promise<IVirtualSourceDocument>((resolve, reject) => {

                this._virtualDatasources.model.addDataSources(virtualSourceObj).then(newSource => {
                    resolve(newSource);
                });
            });
        } catch (err) {
            console.log('error adding virtual source: ' + err);
        }
    }

    createVirtualSourceMapCollection(input): Promise<IMutationResponse> {
        const schema = new mongoose.Schema({}, { strict: false });
        const connection: mongoose.Connection = this._appConnection.get;
        const newCollection = <any>connection.model(input.inputName, schema, input.inputName);

        const dataCollection = <any>input.records;
        const schemaCollection = input.fields;

        return new Promise<IMutationResponse>((resolve, reject) => {
            dataCollection.map(d => {
                const collection: any[] = [];
                for (let i = 0; i < d.length; i++) {
                    const record = d[i];
                    const fieldName = schemaCollection[i].columnName.toLowerCase().replace(/ /g, '_');
                    collection[fieldName] = this.getValueFromDataType(schemaCollection[i].dataType, record);
                }
                collection['source'] = 'Manual entry';
                collection['timestamp'] = moment.utc().toDate();

                const model = new newCollection(collection);
                model.save();
            });

            resolve({success: true});
            return;
        });
    }

    async getVirtualSourceMapCollection(connectorName): Promise<any> {
        try {
            const connector = await this._connectors.model.getConnectorByName(connectorName);

            const dataSource = await this._virtualDatasources.model.getDataSourceByName(connector.virtualSource);

            if (!dataSource) {
                return null;
            }

            const schema = new mongoose.Schema({}, { strict: false });
            const connection: mongoose.Connection = this._appConnection.get;
            const model = connection.model(dataSource.source, schema, dataSource.source);

            const dataModel = await model.find();
            const data = await dataModel.map(data => data['_doc']);

            const dataCollection = {
                'schema': dataSource.fieldsMap,
                'data': data,
                'dataName': connectorName,
                'dateRangeField': dataSource.dateField,
            };

            return JSON.stringify(dataCollection);
        } catch (err) {
            console.log('error getting virtual source collection: ' + err);
        }
    }

    async getVirtualSourceByIdMapCollection(id): Promise<any> {
        try {
            const dataSource = await this._virtualDatasources.model.getDataSourceById(id);

            if (!dataSource) {
                return null;
            }

            const schema = new mongoose.Schema({}, { strict: false });
            const connection: mongoose.Connection = this._appConnection.get;
            const model = connection.model(dataSource.source, schema, dataSource.source);

            const dataModel = await model.find();
            const data = await dataModel.map(data => data['_doc']);

            const dataCollection = {
                'schema': dataSource.fieldsMap,
                'data': data,
                'dataName': dataSource.name,
                'dateRangeField': dataSource.dateField
            };

            return JSON.stringify(dataCollection);
        } catch (err) {
            console.log('error getting virtual source collection: ' + err);
        }
    }

    removeDataEntry(name: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this._virtualDatasources.model.getDataSourceByName(name).then(dataSource => {
                if (!dataSource) {
                    reject('the virtual source ' + name + ' do not exist');
                    return;
                }

                this.dataEntryInUseByModel(dataSource.id).then((virtualSources: IKPIDocument[]) => {

                    // check if data entry is in use by another model
                    if (virtualSources.length) {
                        reject({ message: 'Data entry is being used by ', entity: virtualSources, error: 'Data entry is being used by '});
                        return;
                    }

                    return this._virtualDatasources.model.removeDataSources(name).then(res => {
                        resolve(res);
                    })
                    .catch(err => {
                        reject('cannot remove data source: ' + err);
                    });
                })
                .catch(err => {
                    reject('cannot get data entry in use: ' + err);
                });
            })
            .catch(err => {
                reject('cannot get data source by name: ' + err);
            });
        });
    }

    removeVirtualSourceMapCollection(source): Promise<any> {
        return new Promise<IMutationResponse>((resolve, reject) => {
            try {
                const connection: mongoose.Connection = this._appConnection.get;
                connection.db.dropCollection(source);
                resolve({success: true});
                return;
            } catch (err) {
                console.log(err);
                resolve({success: false, errors: err});
            }
        });
    }

    getValueFromDataType(dataType, inputValue) {
        switch (dataType) {
            case 'Number':
                if (inputValue === null || inputValue === '') {
                    return 0;
                }
                if (inputValue.toString().split('.').length > 1) {
                    return toNumber(inputValue);
                } else {
                    return toInteger(inputValue);
                }
            case 'Date':
                return moment.utc(inputValue).toDate();
            case 'Boolean':
                if (!isBoolean(inputValue)) {
                    const booleanValue: boolean = inputValue === '1' || inputValue === 'true';
                    inputValue = booleanValue;
                }
                return inputValue as boolean;
            default:
                return inputValue;
        }
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

        // process the virtual source aggregate
        let vsAggregate;

        let vsAggregateReplacements: IKeyValues = { };

        if (dateRangeFilter) {
            vsAggregateReplacements = {
                '__from__': dateRangeFilter['$gte'],
                '__to__': dateRangeFilter['$lt'],
                '__timezone__': this.timezone
            };

        }

        const aggregateResult = this._vsAggregateService.processReplacements(
            vs, vsAggregateReplacements
        );

        vsAggregate = aggregateResult.aggregate;

        const fields =
            Object.keys(vs.fieldsMap)
                  .map(k => { return { name: k, value: vs.fieldsMap[k].path }; });

        // construct match stage
        if (sourceFieldCriterias && sourceFieldCriterias.length) {
            const match = { $match : { source: { $in: sourceFieldCriterias } } };
            aggregate.push(match);
        }

        // original aggregate
        if (vsAggregate && vsAggregate.length) {
            const originalAgg =
                vsAggregate
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
            name: { $regex: new RegExp(`^${dataSource}$`, 'i')}
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

    async dataSourceByName(name: string): Promise<DataSourceResponse> {
        try {
            const dataSource = await this._virtualDatasources.model.getDataSourceByName(name);

            if (!dataSource) {
                return null;
            }

            const dataSourceResponse = {
                name: dataSource.name,
                description: dataSource.description,
                dataSource: dataSource.source,
            };
            return <any>dataSourceResponse;
        }
        catch (err) {
            console.log(err);
        }
    }

    async dataEntryInUseByModel(id: string): Promise<IKPIDocument[]> {
        const that = this;

        return new Promise<IKPIDocument[]>((resolve, reject) => {
            // reject if no id is provided
            if (!id) {
                return reject({ success: false,
                                errors: [ { field: 'id', errors: ['Data entry not found']} ] });
            }

            const expressionId: RegExp = new RegExp(id, 'i');

            const connectorsArray: any[] = [];

            this._virtualDatasources.model.findById(id)
                .then(connector => {

                    const virtualSourceName = connector.name || null;

                    // contain regex expression to use for complex kpi
                    const expressionName: RegExp = new RegExp(virtualSourceName);

                    this._kpis.model.find({
                        expression: {
                            $regex: expressionName,
                        },
                        type: 'simple'
                    })
                    .then(kpis => {
                        if (!kpis.length) {
                            resolve([]);
                            return;
                        }

                        const expressionKpiId: RegExp[] = kpis.map(k => new RegExp(k.id, 'i'));

                        this._kpis.model.find({
                            type: { $ne: 'simple' },
                            $or: [{
                                expression: {
                                    $regex: expressionName
                                }
                            }, {
                                expression: {
                                    $in: expressionKpiId
                                }
                            }, {
                                expression: {
                                    $regex: expressionId
                                }
                            }]
                        })
                        .then(res => {
                            kpis = kpis.concat(<any>res);
                            if (kpis.length) {
                                kpis.forEach(k => {
                                    connectorsArray.push({
                                        name: k.name,
                                        type: 'kpi'
                                    });
                                });
                                resolve(connectorsArray);
                            }
                        });
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

    async processExcelFile(worksheet): Promise<string> {
        const alphExtended = this.getAlphabetExtended();
        let excelFileData = {
            fields: [],
            records: []
        };

        let j = 1;
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const nrows = range.e.r - range.s.r + 1;
        for (let i = 1; i <= nrows; i++) {
          const dataArray = [];
          alphExtended.map(alph => {
            const cell = alph + i;
            let cellValue = '';
            if (worksheet[cell]) {
              cellValue = <any>worksheet[cell].w.trimEnd();
            }

            if (j === 1) {
              if (cellValue !== '') {
                const newfield = {
                  columnName: cellValue,
                  dataType: '',
                  required: false
                };

                excelFileData.fields.push(newfield);
              }
            } else if (dataArray.length < excelFileData.fields.length) {
              dataArray.push(cellValue);
            }
          });

          const dataArrayValueNotNull = dataArray.filter(d => d !== '');
          if (dataArray.length > 0 && dataArrayValueNotNull.length > 0) {
            excelFileData.records.push(dataArray);
          }

          j += 1;
        }

        if (excelFileData.records.length > 0) {
          for (let n = 0; n < excelFileData.records[0].length; n++) {
            const element = excelFileData.records[0][n];
            const cellDataType = this.getDataTypeFromValue(element);
            excelFileData.fields[n].dataType = cellDataType;
          }
        }

        return JSON.stringify(excelFileData);
    }

    async processCsvFile(fileData): Promise<string> {
        const headerLength = this._getCsvHeaderArray(fileData, ',').length;

        let csvFileData = {
            fields: [],
            records: []
        };

        csvFileData.records = this._getDataRecordsArrayFromCSVFile(fileData,
          headerLength, csvTokenDelimeter);

        if (csvFileData.records.length === 0) {
          return;
        }

        csvFileData.fields = this._getFieldsArrayFromCSVFile(fileData, csvFileData);

        return JSON.stringify(csvFileData);
    }

    private _getCsvHeaderArray(csvRecordsArr, tokenDelimeter) {
        const headers = csvRecordsArr[0].split(tokenDelimeter);
        const headerArray = [];
        for (let j = 0; j < headers.length; j++) {
            headerArray.push(headers[j]);
        }
        return headerArray;
    }

    private _getFieldsArrayFromCSVFile(csvRecordsArray, csvFileData) {
        const fieldsArray = csvRecordsArray[0].split(csvTokenDelimeter);
        let fields: any[] = [];

        for (let i = 0; i < fieldsArray.length; i++) {
            const element = fieldsArray[i];
            const dataType = this.getDataTypeFromValue(csvFileData.records[0][i]);
            fields.push({
                columnName: element,
                dataType: dataType,
                required: dataType === 'Date' ? true : false
            });
        }
        return fields;
    }

    private _getDataRecordsArrayFromCSVFile(csvRecordsArray, headerLength, tokenDelimeter) {
        const dataArr = [];

        for (let i = 1; i < csvRecordsArray.length; i++) {
            const dataRow = csvRecordsArray[i].split(tokenDelimeter);

            const data = [];
            let compositeField = '';
            let concatData = false;
            for (let j = 0; j < dataRow.length; j++) {
                const value = dataRow[j];
                if (value.startsWith('"') && value.endsWith('"')) {
                    data.push(value.replace(/"/g, ''));
                } else if (value.startsWith('"')) {
                    compositeField = value;
                    concatData = true;
                } else if (value.endsWith('"')) {
                    compositeField += ',' + value;
                    concatData = false;
                    data.push(compositeField.replace(/"/g, ''));
                } else if (concatData) {
                    compositeField += ',' + value;
                } else {
                    data.push(value);
                }
            }

            dataArr.push(data);
        }
        return dataArr;
    }

    getDataTypeFromValue(value) {
        let dataType: string;
        if (value === null || value === '') {
            dataType = 'String';
        } else if (isBoolean(value) || value === '0' || value === '1') {
            dataType = 'Boolean';
        } else if (!isNaN(+value)) {
            dataType = 'Number';
        } else if (!isNaN(Date.parse(value))) {
            dataType = 'Date';
        } else {
            dataType = 'String';
        }
        return dataType;
    }

    getAlphabetExtended(): string[] {
        let resultArr = Alphabet;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 26; j++) {
                resultArr.push(Alphabet[i] + Alphabet[j]);
            }
        }
        return resultArr;
    }
}