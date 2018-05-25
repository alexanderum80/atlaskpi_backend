import { IObject } from '../../../app_modules/shared/criteria.plugin';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';
import { isObject, isEmpty } from 'lodash';

import { input } from '../../../framework/decorators/input.decorator';
import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';
import { IVirtualSourceModel, IVirtualSourceDocument, IFilterOperator } from '../virtual-sources/virtual-source';
import { DataSourceField, DataSourceResponse } from '../../../app_modules/data-sources/data-sources.types';
import { IIdName } from '../../common/id-name';
import { IValueName } from '../../common/value-name';

const Schema = mongoose.Schema;

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
    createdOn: { type: Date, default: Date.now }
});

// STATIC
VirtualSourceSchema.statics.getDataSources = getDataSources;
VirtualSourceSchema.statics.getDataSourceByName = getDataSourceByName;

// METHODS
VirtualSourceSchema.methods.getGroupingFieldPaths = getGroupingFieldPaths;
VirtualSourceSchema.methods.findByNames = findByNames;
VirtualSourceSchema.methods.getFieldDefinition = getFieldDefinition;
VirtualSourceSchema.methods.getDataTypeOperator = getDataTypeOperator;
VirtualSourceSchema.methods.getDataSourceFieldsMap = mapDataSourceFields;
// VirtualSourceSchema.methods.containsPath = containsPath;

@injectable()
export class VirtualSources extends ModelBase<IVirtualSourceModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'VirtualSource', VirtualSourceSchema, 'virtualSources');
    }
}

async function getDataSources(names?: string[]): Promise<DataSourceResponse[]> {
    const model = this as IVirtualSourceModel;

    try {
        const query = names ? { name: { $in: names } } : { };
        const virtualSources = await model.find(query);
        const dataSources: DataSourceResponse[] = virtualSources.map(ds => {
        const fields = mapDataSourceFields(ds);

            return {
                name: ds.name.toLocaleLowerCase(),
                description: ds.description,
                dataSource: ds.source,
                fields: fields,
                externalSource: ds.externalSource,
                filterOperators: ds.filterOperators as any
            };
        });

        return dataSources;
    } catch (e) {
        console.error('Error getting virtual sources');
        return [];
    }
}

async function getDataSourceByName(name: string): Promise<IVirtualSourceDocument> {
    const model = this as IVirtualSourceModel;

    try {
        const regexName: RegExp = new RegExp(name, 'i');
        const query: IObject = { name: { $regex: regexName } };
        return await model.findOne(query);
    } catch (e) {
        console.log('Error getting virtual source fields');
        return {} as any;
    }
}

function mapDataSourceFields(virtualSource: IVirtualSourceDocument): DataSourceField[] {
    // with the new feature to filter kpi by sources we do not need to send the "source" field anymore
    const fieldsMap = virtualSource.fieldsMap;
    const fieldNames = Object.keys(virtualSource.fieldsMap).filter(k => k.toLowerCase() !== 'source').sort();

    return fieldNames.map(key => ({
        name: key,
        path: fieldsMap[key].path,
        type: fieldsMap[key].dataType,
        allowGrouping: fieldsMap[key].allowGrouping
    }));
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

async function findByNames(names: string): Promise<IVirtualSourceDocument[]> {
    return this.find({ name: { $in: names } });
}

