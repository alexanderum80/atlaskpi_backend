import { isArray, isObject } from 'lodash';

import { isArrayObject } from '../../../helpers/express.helpers';
import { readMongooseSchema } from '../../../helpers/mongodb.helpers';
import { flatten } from '../../../helpers/object.helpers';
import { ExpenseSchema } from '../expenses/expense.model';
import { InventorySchema } from '../inventory/inventory.model';
import { SaleSchema } from '../sales/sale.model';
import { GoogleAnalyticsSchema } from './../google-analytics/google-analytics.model';
import { IKPIFilter, KPITypeEnum } from './kpi';

const Schemas = [
      SaleSchema,
      ExpenseSchema,
      InventorySchema,
      GoogleAnalyticsSchema
];

const replacementStrings = [
    { key: '__dot__', value: '.' },
    { key: '__dollar__', value: '$' }
];

export class KPIFilterHelper {
    public static ComposeFilter(kpiType: KPITypeEnum, filter: string): any {

        switch (kpiType) {
            case KPITypeEnum.Simple:
                if (!filter) { return null; }
                const simpleFilters: IKPIFilter[] = JSON.parse(filter);
                return KPIFilterHelper._composeSimpleFilter(simpleFilters);

            case KPITypeEnum.ExternalSource:
                if (!filter) { return null; }
                const externalsourceFilters: IKPIFilter[] = JSON.parse(filter);
                return KPIFilterHelper._composeSimpleFilter(externalsourceFilters);

            default:
                return filter;
        }
    }

    public static DecomposeFilter(kpiType: KPITypeEnum, filter: any): any {

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

    public static PrepareFilterField(type: string, filter: string): string {
        switch (type) {
            case KPITypeEnum.Simple:
                return KPIFilterHelper.DecomposeFilter(type, filter);

            case KPITypeEnum.ExternalSource:
                return KPIFilterHelper.DecomposeFilter(type, filter);

            default:
                return filter;

        }
    }

    private static _composeSimpleFilter(filterArray: IKPIFilter[]): string {
        if (filterArray.length < 1) { return null; }


        // TODO: this should be refactor to get only get the fields of the source model
        const fieldset = this._allSchemasFieldSet();

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
        let newFilter = {};
        Object.keys(filter).forEach(filterKey => {
            let newKey = filterKey;

            replacementStrings.forEach(replacement => {
                if (operation === 'serialize') {
                    newKey = newKey.replace(replacement.value, replacement.key);
                } else if (operation === 'deserialize') {
                    newKey = newKey.replace(replacement.key, replacement.value);
                }
            });

            let value = filter[filterKey];

            if (!isArray(value) && isObject(value)) {
                value = KPIFilterHelper._serializer(value, operation);
            } else if (isArrayObject(value)) {
                for (let i = 0; i < value.length; i++) {
                    value[i] = this._serializer(value[i], operation);
                }
            }

            newFilter[newKey] = value;
        });
        return newFilter;
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
            criteria = value.map(v => String(v)).join(',');
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