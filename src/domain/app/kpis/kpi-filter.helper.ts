import { VALUE_SEPARATOR } from '../../../helpers/string.helpers';
import { CallSchema } from '../calls/call.model';
import { isArray, isObject, isDate } from 'lodash';

import { isArrayObject } from '../../../helpers/express.helpers';
import { readMongooseSchema } from '../../../helpers/mongodb.helpers';
import { flatten } from '../../../helpers/object.helpers';
import { ExpenseSchema } from '../expenses/expense.model';
import { InventorySchema } from '../inventory/inventory.model';
import { SaleSchema } from '../sales/sale.model';
import { GoogleAnalyticsSchema } from './../google-analytics/google-analytics.model';
import { IKPIFilter, KPITypeEnum, IKPISimpleDefinition } from './kpi';
import { AppointmentSchema } from '../appointments/appointment-model';
import { IVirtualSourceDocument } from '../virtual-sources/virtual-source';
import { isString, isNumber } from 'util';


const Schemas = [
      SaleSchema,
      ExpenseSchema,
      InventorySchema,
      GoogleAnalyticsSchema,
      CallSchema,
      AppointmentSchema
];

const datasourceSchemaMap = {
    'sales': SaleSchema,
    'expenses': ExpenseSchema,
    'inventory': InventorySchema,
    'googleanalytics': GoogleAnalyticsSchema,
    'calls': CallSchema,
    'appointments': AppointmentSchema
};

const replacementStrings = [
    { key: '__dot__', value: '.' },
    { key: '__dollar__', value: '$' }
];

export class KPIFilterHelper {
    static ComposeFilter(
        kpiType: KPITypeEnum,
        virtualSources: IVirtualSourceDocument[],
        rawExpression: string,
        filter: string): any {

        let simpleDefinition: IKPISimpleDefinition;

        switch (kpiType) {
            case KPITypeEnum.Simple:
                if (!filter) { return null; }
                const simpleFilters: IKPIFilter[] = JSON.parse(filter);
                simpleDefinition = JSON.parse(rawExpression);
                return KPIFilterHelper._composeSimpleFilter(virtualSources, simpleDefinition.dataSource, simpleFilters);

            case KPITypeEnum.ExternalSource:
                if (!filter) { return null; }
                const externalsourceFilters: IKPIFilter[] = JSON.parse(filter);
                simpleDefinition = JSON.parse(rawExpression);
                return KPIFilterHelper._composeSimpleFilter(virtualSources, simpleDefinition.dataSource, externalsourceFilters);

            default:
                return filter;
        }
    }

    static DecomposeFilter(kpiType: KPITypeEnum, filter: any): any {

        switch (kpiType) {
            case KPITypeEnum.Simple:
                if (!filter) { return null; }
                return KPIFilterHelper._decomposeSimpleFilter(filter);
            case KPITypeEnum.ExternalSource:
                if (!filter) { return null; }
                return KPIFilterHelper._decomposeSimpleFilter(filter);
            default:
                return filter;
        }
    }

    static PrepareFilterField(type: string, filter: string): string {
        switch (type) {
            case KPITypeEnum.Simple:
                return KPIFilterHelper.DecomposeFilter(type, filter);

            case KPITypeEnum.ExternalSource:
                return KPIFilterHelper.DecomposeFilter(type, filter);

            default:
                return filter;

        }
    }

    static CleanObjectKeys(filter: any): any {
        return KPIFilterHelper._deserializeFilter(filter);
    }

    private static _composeSimpleFilter(virtualSources: IVirtualSourceDocument[], datasource: string, filterArray: IKPIFilter[]): string {
        if (filterArray.length < 1) { return null; }

        const cleanDatasource = datasource.split('$')[0];
        const virtualSource = virtualSources.find(v => v.name.toLowerCase() === cleanDatasource.toLowerCase());
        let fieldset: any;

        if (virtualSource) {
            fieldset = {};
            const map = virtualSource.fieldsMap;
            Object.keys(virtualSource.fieldsMap).forEach(k => fieldset[map[k].path] = map[k].dataType);
        } else {
            fieldset = this._getFieldsetForDatasource(cleanDatasource);
        }

        const mongoDbFilterArray = filterArray.map(f => KPIFilterHelper._transform2MongoFilter(f, fieldset));

        if (filterArray.length > 1) {
            // multiple filter its always an and
            return KPIFilterHelper._serializeFilter({ $and: mongoDbFilterArray.map(f => KPIFilterHelper._serializeFilter(f)) });
        } else {
            // single filter
            return KPIFilterHelper._serializeFilter(mongoDbFilterArray[0]);
        }
    }

    private static _decomposeSimpleFilter(filter: any): IKPIFilter[] {
        const deserialized = KPIFilterHelper._deserializeFilter(filter);
        if (deserialized['$and']) {
            return deserialized['$and'].map(c => KPIFilterHelper._transform2KPIFilter(c));
        }
        return [KPIFilterHelper._transform2KPIFilter(deserialized)];
    }

    private static _deserializeFilter(filter: any): any {
        return KPIFilterHelper._serializer(filter, 'deserialize');
    }

    private static _serializeFilter(filter: any): any {
        return KPIFilterHelper._serializer(filter, 'serialize');
    }

    private static _serializer(filter: any, operation = 'serialize'): any {
        if (isNumber(filter)) {
            return filter;
        }

        if (isString(filter)) {
            return KPIFilterHelper._getCleanString(filter, operation);
        }

        let newFilter = {};
        Object.keys(filter).forEach(filterKey => {
            let newKey = KPIFilterHelper._getCleanString(filterKey, operation);
            let value = filter[filterKey];

            if (!isArray(value) && !isDate(value) && isObject(value)) {
                value = KPIFilterHelper._serializer(value, operation);
            } else if (!isDate(value) && isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this._serializer(value[i], operation);
                }
            }

            newFilter[newKey] = value;
        });
        return newFilter;
    }

    private static _getCleanString(text: string, operation: string) {
        let result: string = text;

        replacementStrings.forEach(replacement => {
            if (operation === 'serialize') {
                result = result.replace(replacement.value, replacement.key);
            } else if (operation === 'deserialize') {
                result = result.replace(replacement.key, replacement.value);
            }
        });

        return result;
    }

    private static _allSchemasFieldSet() {
        let fieldset = [];

        Schemas.forEach(s => {
            const objectifiedSchema = readMongooseSchema(s);
            const flattenedSchema = flatten(objectifiedSchema);
            Object.keys(flattenedSchema).forEach(k => {
                fieldset[k] = flattenedSchema[k];
            });
        });

        return fieldset;
    }

    private static _getFieldsetForDatasource(datasource: string) {
        let fieldset = [];
        let schema = datasourceSchemaMap[datasource];
        const objectifiedSchema = readMongooseSchema(schema);
        const flattenedSchema = flatten(objectifiedSchema);
        Object.keys(flattenedSchema).forEach(k => {
            fieldset[k] = flattenedSchema[k];
        });

        return fieldset;
    }

    private static _transform2MongoFilter(f: IKPIFilter, fieldSet): any {
        let filter = {};
        filter[f.field] = {};
        filter[f.field]['$' + f.operator] = KPIFilterHelper._operatorValuePairIntent(f, fieldSet);
        return filter;
    }

    private static _operatorValuePairIntent(f: IKPIFilter, fieldset: any[]): any {
        switch (f.operator) {
            case 'nin':
                return KPIFilterHelper._handleAsArrayOperatorValuePairIntent(f, fieldset);
            case 'in':
                return KPIFilterHelper._handleAsArrayOperatorValuePairIntent(f, fieldset);
            default:
                return KPIFilterHelper._handleAsElementOperatorValuePairIntent(f.criteria, f.field, fieldset);
        }
    }

    private static _handleAsArrayOperatorValuePairIntent(f: IKPIFilter, fieldset: any[]): any {
        return f.criteria.split('|')
                          .map(value =>
                               KPIFilterHelper._handleAsElementOperatorValuePairIntent(value, f.field, fieldset)
        );
    }

    private static _handleAsElementOperatorValuePairIntent(value: any, field: string, fieldset: any[]): any {
        const type = fieldset[field];
        if (!type) {
            console.log('type not found when saving kpi filters to database');
            return null;
        }

        switch (type) {
            case 'Number':
                return Number(value);
            case 'Date':
                return new Date(value);
            case 'Boolean':
                return Boolean(value === 'true' || value === true);
            default:
                return String(value);
        }
    }

    private static _transform2KPIFilter(obj: any): IKPIFilter {
        if (!obj || !isObject(obj)) { return null; }

        const field = Object.keys(obj)[0];
        const op = Object.keys(obj[field])[0];
        const value = obj[field][op];

        if (!field || !op) { return null; }

        let criteria;

        if (isArray(value)) {
            criteria = value.map(v => String(v)).join(VALUE_SEPARATOR);
        } else {
            criteria = String(value);
        }

        return <IKPIFilter> {
                                field: field,
                                operator: String(op).replace('$', ''),
                                criteria: criteria
                            };
    }

}