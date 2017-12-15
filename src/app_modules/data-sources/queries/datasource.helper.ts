import { injectable } from 'inversify';
import * as mongoose from 'mongoose';
import { SaleSchema } from '../../../domain/app/sales/sale.model';
import { ExpenseSchema } from '../../../domain/app/expenses/expense.model';
import { field } from '../../../framework/decorators/field.decorator';
import { readMongooseSchema } from '../../../helpers/mongodb.helpers';
import { flatten } from '../../../helpers/object.helpers';
import { GroupingMap } from '../../charts/queries/chart-grouping-map';
import { IKPIDataSourceHelper } from '../../../domain/app/kpis/kpi';
import {
    sortBy,
    isObject
} from 'lodash';
import * as Promise from 'bluebird';

export const DataSourceSchemasMapping = [
    {
        name: 'sales',
        definition: SaleSchema
    },
    {
        name: 'expenses',
        definition: ExpenseSchema
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

    public static GetGroupingsExistInCollectionSchema(schemaName: string, groupMappings: any, kpiService: IKPIDataSourceHelper): any {
        const that = this;
        // get sales and expense mongoose models
        const model = {
            sales: kpiService.salesModel,
            expenses: kpiService.expenseModel
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