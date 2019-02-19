import { camelCase } from 'change-case';
import * as Bluebird from 'bluebird';
import { inject, injectable } from 'inversify';
import { sortBy, isEmpty } from 'lodash';
import * as mongoose from 'mongoose';

import { DataSourceField, DataSourceResponse } from '../../../app_modules/data-sources/data-sources.types';
import { IObject, ICriteriaAggregate } from '../../../app_modules/shared/criteria.plugin';
import { ModelBase } from '../../../type-mongo/model-base';
import { IValueName } from '../../common/value-name';
import { AppConnection } from '../app.connection';
import { IFilterOperator, IVirtualSourceDocument, IVirtualSourceModel, IVirtualSource, IFieldMetadata } from '../virtual-sources/virtual-source';
import { KPIFilterHelper } from '../kpis/kpi-filter.helper';
import { VirtualSourceAggregateService, IKeyValues, ObjectReplacementPattern } from './vs-aggregate.service';

const COLLECTION_SOURCE_MAX_LIMIT = 20;
const COLLECTION_SOURCE_FIELD_NAME = 'source';

const FilterOperator = new mongoose.Schema({
    description: String,
    name: String,
    operator: String,
    exp: String,
    listSeparator: String
});

const DataTypeFiltersSchema = new mongoose.Schema({
    Number: [FilterOperator],
    String: [FilterOperator]
});

const VirtualSourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    sourceCollection: {
        type: String,
        // required: true
    },
    source: { type: String, required: true },
    modelIdentifier: { type: String, required: true },
    dateField: { type: String, required: true },
    aggregate: {
        type: [mongoose.Schema.Types.Mixed],
        // required: true
    },
    fieldsMap: { type: mongoose.Schema.Types.Mixed, required: true },
    externalSource: Boolean,
    filterOperators: DataTypeFiltersSchema,
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    dataEntry: Boolean,
    users: [String]
});

// STATIC
VirtualSourceSchema.statics.getDataSources = getDataSources;
VirtualSourceSchema.statics.getDataSourceByName = getDataSourceByName;
VirtualSourceSchema.statics.getDataSourceById = getDataSourceById;
VirtualSourceSchema.statics.getDataEntry = getDataEntry;
VirtualSourceSchema.statics.addDataSources = addDataSources;
VirtualSourceSchema.statics.removeDataSources = removeDataSources;

// METHODS
VirtualSourceSchema.methods.getGroupingFieldPaths = getGroupingFieldPaths;
VirtualSourceSchema.methods.findByNames = findByNames;
VirtualSourceSchema.methods.getFieldDefinition = getFieldDefinition;
VirtualSourceSchema.methods.getDataTypeOperator = getDataTypeOperator;
VirtualSourceSchema.methods.getDistinctValues = getDistinctValues;
// VirtualSourceSchema.methods.containsPath = containsPath;
VirtualSourceSchema.methods.mapDataSourceFields = mapDataSourceFields;

@injectable()
export class VirtualSources extends ModelBase<IVirtualSourceModel> {
    constructor(
        @inject(AppConnection.name) appConnection: AppConnection
    ) {
        super();
        this.initializeModel(appConnection.get, 'VirtualSource', VirtualSourceSchema, 'virtualSources');
    }
}

async function getDataSources(names?: string[]): Promise<DataSourceResponse[]> {
    const model = this as IVirtualSourceModel;

    try {
        const query = names ? { name: { $in: names } } : { };
        const virtualSources = await model.find(query);
        // let dataSources: DataSourceResponse[] = virtualSources.map(ds => {
        //     const fields = mapDataSourceFields(ds);

        //     return {
        //         name: ds.name.toLowerCase(),
        //         description: ds.description,
        //         dataSource: ds.source,
        //         fields: fields,
        //         externalSource: ds.externalSource,
        //         filterOperators: ds.filterOperators as any
        //     };
        // });

        const dataSources = await Bluebird.map(
            virtualSources,
            async(vs) => {
                const dataSource: any = {
                    name: vs.name.toLowerCase(),
                    description: vs.description,
                    dataSource: vs.source,
                    fields: mapDataSourceFields(vs),
                    externalSource: vs.externalSource,
                    filterOperators: vs.filterOperators as any
                };

                dataSource.sources = await getDistinctSourceValues(vs);
                return dataSource;
            },
            // { concurrency: 10 }
        );

        // (let virtualSource of virtualSources) {
        //     const dataSource = virtualSource.toObject() as DataSourceResponse;
        //     dataSource.name = dataSource.name.toLowerCase();
        //     dataSource.sources = await getDistinctSourceValues(virtualSource);
        // }

        // dataSources = await Bluebird.map(
        //     dataSources,
        //     async (ds: DataSourceResponse) =>
        //         await filterSourceAndFieldsWithData(
        //             ds,
        //             virtualSources.find(vs => vs.name.toLowerCase() === ds.name.toLowerCase())),
        //     { concurrency: 10 }
        // );

        return sortBy(dataSources, 'name');
    } catch (e) {
        console.error('Error getting virtual sources');
        return [];
    }
}

async function getDataEntry(userId: string): Promise<DataSourceResponse[]> {
    const model = this as IVirtualSourceModel;

    try {
        const virtualSources = await model.find({ dataEntry: true, users: userId});

        const dataSources = await Bluebird.map(
            virtualSources,
            async(vs) => {
                const dataSource: any = {
                    _id: vs.id,
                    name: vs.name.toLowerCase(),
                    description: vs.description,
                    dataSource: vs.source,
                    fields: mapDataSourceFields(vs),
                    externalSource: vs.externalSource,
                    filterOperators: vs.filterOperators as any,
                    dataEntry: vs.dataEntry,
                    users: vs.users,
                    createdBy: vs.createdBy
                };
                dataSource.sources = await getDistinctSourceValues(vs);
                return dataSource;
            }
        );

         return sortBy(dataSources, 'name');
    } catch (e) {
        console.error('Error getting virtual sources');
        return [];
    }
}


// async function filterSourceAndFieldsWithData(ds: DataSourceResponse, vs: IVirtualSourceDocument): Promise<DataSourceResponse> {
//     try {
//         const filter = '';
//         const distinctValues: string[] = await getDistinctValues(
//             vs,
//             COLLECTION_SOURCE_FIELD_NAME,
//             COLLECTION_SOURCE_MAX_LIMIT,
//             filter
//         );

//         ds.sources = distinctValues;
//         // ds.fields = await this.filterFieldsWithoutData(ds);
//         return ds;
//     } catch (e) {
//         console.error(e);
//     }
// }

async function getDistinctValues(
    vs: IVirtualSourceDocument,
    fieldName: string,
    limit: number,
    filter: string,
    vsAggregateService: VirtualSourceAggregateService,
    collectionSource?: string[]): Promise<string[]> {
    try {
        let model: mongoose.Model<any>;

        model = vs.db.model(
            vs.modelIdentifier,
            new mongoose.Schema({}, { strict: false }),
            vs.source
        );

        (model as any).findCriteria = findCriteria;

        let aggregate = [];

        if (vs.aggregate) {
            aggregate = vs.aggregate.map(a => {
                return KPIFilterHelper.CleanObjectKeys(a);
            });

            aggregate = vsAggregateService.applyDateRangeReplacement(aggregate);
        }

        const formulaFieldStage = vsAggregateService.generateFormulaFieldStage(this);

        if (formulaFieldStage) aggregate.push(formulaFieldStage);

        return await (model as any).findCriteria(fieldName, aggregate, limit, filter, collectionSource);
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function getDataSourceByName(name: string): Promise<IVirtualSourceDocument  | null > {
    const model = this as IVirtualSourceModel;

    try {
        const regExp = new RegExp(`^${name}$`, 'i');
        const query: IObject = { name: regExp };
        const vs = await model.findOne(query);
        return vs;

    } catch (e) {
        console.log('Error getting virtual source fields', e);
        return null;
    }
}

async function getDataSourceById(id: string): Promise<IVirtualSourceDocument> {
    const model = this as IVirtualSourceModel;
    try {
        return await model.findOne({ _id: id});
    } catch (e) {
        console.log('Error getting virtual source fields');
        return {} as any;
    }
}

export function mapDataSourceFields(virtualSource: IVirtualSourceDocument, excludeSourceFiled = true): DataSourceField[] {
    // with the new feature to filter kpi by sources we do not need to send the "source" field anymore
    // !!!UPDATE: we do need the source in the groupings so we should specify if we do not want to exclude the source field.

    const fieldsMap = virtualSource.fieldsMap;
    let fieldNames = Object.keys(virtualSource.fieldsMap)
                           .sort();

    fieldNames = excludeSourceFiled
        ? fieldNames.filter(k => k.toLowerCase() !== 'source')
        : fieldNames;

    return fieldNames.map(key => ({
        name: key,
        path: fieldsMap[key].path,
        type: fieldsMap[key].dataType,
        allowGrouping: fieldsMap[key].allowGrouping,
        sourceOrigin: fieldsMap[key].sourceOrigin || null
    }));
}
export function transformFieldsToRealTypes(dataDocument: any, fieldsToMap ) {

    let fieldNames = Object.keys(fieldsToMap)
                           .sort();

 
    fieldNames.forEach(key => {
        if(dataDocument[fieldsToMap[key].path]) {

            switch ( fieldsToMap[key].dataType ) {
                case 'String':
                dataDocument[fieldsToMap[key].path] = String(dataDocument[fieldsToMap[key].path]);
                    break;
                case 'Number':
                    dataDocument[fieldsToMap[key].path] = Number(dataDocument[fieldsToMap[key].path]);
                    break;
                case 'Date':
                dataDocument[fieldsToMap[key].path] = new Date(dataDocument[fieldsToMap[key].path]);
                    break;
                default:
                    break;
            }
    }
    });

    return dataDocument;
}



function addDataSources(data: any): Promise<IVirtualSourceDocument> {
    // with the new feature to filter kpi by sources we do not need to send the "source" field anymore
    const that = this;

    return new Promise<IVirtualSourceDocument>((resolve, reject) => {
        return that.create(data)
            .then((newConnector: IVirtualSourceDocument) => {
                resolve(newConnector);
                return;
            })
            .catch(err => {
                reject('cannot create virtual source: ' + err);
                return;
            });
    });
}

function removeDataSources(name: string): Promise<IVirtualSourceDocument> {
    // with the new feature to filter kpi by sources we do not need to send the "source" field anymore
    const that = this;
    if (!name) { return Promise.reject('cannot remove a document with, empty payload'); }
    return new Promise<IVirtualSourceDocument>((resolve, reject) => {

        this.getDataSourceByName(name).then(data => {
            if (!data) {
                reject('the virtual source ' + name + ' do not exist');
                return;
            }

            return data.remove()
                .then((newConnector: IVirtualSourceDocument) => {
                    resolve(newConnector);
                    return;
                })
                .catch(err => {
                    reject('cannot remove virtual source: ' + err);
                    return;
                });
        });
    });
}


function getGroupingFieldPaths(): IValueName[] {
    const doc = this as IVirtualSourceDocument;
    const fields: IValueName[] = [];

    Object.keys(doc.fieldsMap).forEach(k => {
        const map = doc.fieldsMap[k];

        if (map.allowGrouping) {
            fields.push({ value: map.path, name: k });
        }
    });

    return fields;
}

function getFieldDefinition(fieldName: string) {
    const doc = this as IVirtualSourceDocument;
    let field;

    Object.keys(doc.fieldsMap).forEach(f => {
        if (doc.fieldsMap[f].path === fieldName) {
            field = doc.fieldsMap[f];
            return;
        }
    });

    return field;
}

function getDataTypeOperator(dataType: string, filterName: string): IFilterOperator {
    if (!dataType || !filterName) {
        return null;
    }

    const doc = this as IVirtualSourceDocument;
    const typeOperators = doc.filterOperators[dataType];

    return typeOperators.find(o => o.name === filterName);
}

function findCriteria(field: string, aggregate: any[], limit?: number, filter?: string, collectionSource?: string[]): Promise<string[]> {
    const that = this;

    let aggregateOptions = aggregate.concat(criteriaAggregation({ field, limit, filter, collectionSource }));

    return new Promise<string[]>((resolve, reject) => {
        const agg = that.aggregate(aggregateOptions);
        agg.options = { allowDiskUse: true };

        agg.then(res => {
            const results = mapResults(res);

            resolve(results);
            return;
        }).catch(err => {
            reject(err);
            return;
        });
    });
}

function criteriaAggregation(input: { field: string, limit?: number, filter?: string, collectionSource?: string[] }): ICriteriaAggregate[] {
    const unwindField = input.field.split('.')[0];

    let aggregate: ICriteriaAggregate[] = [{
        '$unwind': `$${unwindField}`
    }, {
        '$match': { [input.field]: { '$nin': ['', null, 'null', 'undefined'] } }
    }, {
        '$group': {
            _id: {
                'field': `$${input.field}`
            }
        }
    }];

    aggregate = aggregate.concat({
        $limit: input.limit
    });

    // get the $match object
    let matchStage: ICriteriaAggregate = findStage(aggregate, '$match');

    if (!matchStage.$match) {
        matchStage.$match = {};
    }

    if (!isEmpty(input.filter)) {
        // contain regular expression that is case insensitive
        const reg: RegExp = new RegExp(input.filter, 'i');
        // i.e. match: { [field]: { $regex: reg } }
        Object.assign(matchStage.$match[input.field], {
            $regex: reg
        });
    }

    const collectionSource = input.collectionSource;
    if (Array.isArray(collectionSource) && collectionSource.length) {
        Object.assign(matchStage.$match, {
            source: {
                '$in': collectionSource
            }
        });
    }

    return aggregate;
}

function findStage(aggregate: ICriteriaAggregate[], field: string): ICriteriaAggregate {
    // i.e. return value => undefined, or { [key]: value }
    return aggregate.find(a => a[field] !== undefined);
}

function mapResults(res: any[]): string[] {
    if (!res || !res.length) { return []; }
    return res.map(r => r._id.field);
}

async function findByNames(names: string): Promise<IVirtualSourceDocument[]> {
    return this.find({ name: { $in: names } });
}


async function getDistinctSourceValues(vs: IVirtualSourceDocument): Promise<string[]> {
    try {
        let model: mongoose.Model<any>;

        model = vs.db.model(
            vs.modelIdentifier,
            new mongoose.Schema({}, { strict: false }),
            camelCase(vs.source)
        );

        return model.distinct(COLLECTION_SOURCE_FIELD_NAME);
    } catch (e) {
        console.error(e);
        return [];
    }
}
