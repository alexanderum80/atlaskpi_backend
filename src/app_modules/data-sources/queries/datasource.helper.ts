import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { isObject, sortBy } from 'lodash';
import * as mongoose from 'mongoose';

import { ExpenseSchema } from '../../../domain/app/expenses/expense.model';
import { InventorySchema } from '../../../domain/app/inventory/inventory.model';
import { IKPIDataSourceHelper } from '../../../domain/app/kpis/kpi';
import { SaleSchema } from '../../../domain/app/sales/sale.model';
import { field } from '../../../framework/decorators/field.decorator';
import { readMongooseSchema } from '../../../helpers/mongodb.helpers';
import { flatten } from '../../../helpers/object.helpers';
import { GroupingMap } from '../../charts/queries/chart-grouping-map';

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
                if (isObject) {
                    Object.assign(newObject, obj);
                }
            });
        }
    });
}

@injectable()
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

    public static GetGroupingsForSchema(schemaName: string): string[] {
        const collection = GroupingMap[schemaName];
        return Object.keys(collection);
    }

    public static GetGroupingsExistInCollectionSchema(schemaName: string, groupMappings: any, models: IKPIDataSourceHelper): any {
        const that = this;
        // get sales and expense mongoose models
        const model = {
            sales: models.sales,
            expenses: models.expenses,
            inventory: models.inventory
        };
        // get sales or expense mongoose models
        const collection = GroupingMap[schemaName];

        let permittedFields = [];
        const collectionQuery = [];

        return new Promise<any>((resolve, reject) => {
            // prop: i.e. 'location', 'concept', 'customerName'
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
                }]));

                Promise.all(collectionQuery).then(fieldExist => {
                    // array of arrays with objects
                    if (fieldExist) {
                        // convert to single object
                        const formatToObject = getObjects(fieldExist);
                        // get the keys from the formatToObject
                        permittedFields = Object.keys(formatToObject);
                        return resolve(sortBy(permittedFields));
                    }
                });
            });
        });
    }

}