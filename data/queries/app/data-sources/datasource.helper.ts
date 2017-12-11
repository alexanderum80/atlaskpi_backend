import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { flatten, readMongooseSchema } from '../../../../lib/utils';
import { SaleSchema } from '../../../models/app/sales';
import { GroupingMap } from '../charts';
import { ExpenseSchema } from './../../../models/app/expenses/Expenses';
import { InventorySchema } from './../../../models/app/inventory/Inventory';
import { sortBy, flatten, isObject } from 'lodash';

export const DataSourceSchemasMapping = [
    {
        name: 'sales',
        definition: SaleSchema
    },
    {
        name: 'expenses',
        definition: ExpenseSchema
    },
    {
        name: 'inventory',
        definition: InventorySchema
    }
];

const BlackListedFieldNames = [
    'source',
    'externalId',
    'document.type',
    'document.identifier'
];

interface ISchemaField {
    path: string;
    type: string;
}

function getObjects(arr: any[]): any {
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

export class DataSourcesHelper {
    public static GetFieldsFromSchemaDefinition(schema: mongoose.Schema): ISchemaField[] {

        const objectifiedSchema = readMongooseSchema(schema);
        const flattenedSchema = flatten(objectifiedSchema);
        const fields = Object.keys(flattenedSchema).map(
            key => { return { path: key, type: flattenedSchema[key] }; }
        );

        const filteredFields = fields.filter(field => {
            const blackListed = BlackListedFieldNames.find(name => name === field.path);
            if (blackListed) {
                return null;
            }
            return field;
        });

        return filteredFields;
    }

    public static GetGroupingsForSchema(schemaName: string, chartHelper?: IChartHelper): string[] {
        const collection = GroupingMap[schemaName];
        return Object.keys(collection);
    }

    public static GetGroupingsExistInCollectionSchema(schemaName: string, groupMapping: any, kpiService: any): any {
        const that = this;
        const model = {
            sales: kpiService.salesModel,
            expenses: kpiService.expensesModel
        };
        const collection = GroupingMap[schemaName];

        const permittedFields = [];
        const collectionQuery = [];

        return new Promise<any>((resolve, reject) => {
            Object.keys(collection).forEach(prop => {
                const field = collection[prop];

                collectionQuery.push(model[schemaName].aggregate([{
                    $match: {
                        [field]: { $exists: true}
                    }
                }, {
                    $project: {
                        _id: 0,
                        [prop]: field
                    }
                }, {
                    $limit: 1
                }]);
            });

            Promise.all(collectionQuery).then(fieldExist => {
                if (fieldExist) {
                    const formatToObject = getObjects(fieldExist);

                    permittedFields = Object.keys(formatToObject);
                    return resolve(sortBy(permittedFields));
                }
            });
        });

    }

}