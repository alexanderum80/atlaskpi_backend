import * as mongoose from 'mongoose';

import { flatten, readMongooseSchema } from '../../../../lib/utils';
import { SaleSchema } from '../../../models/app/sales';
import { GroupingMap } from '../charts';
import { ExpenseSchema } from './../../../models/app/expenses/Expenses';
import { InventorySchema } from './../../../models/app/inventory/Inventory';
import { ISalesModel } from '../../../models/app/sales';
import { IExpenseModel } from '../../../models/app/expenses';

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

interface IChartHelper {
    isChartScreen: boolean;
    salesModel: ISaleModel;
    expenseModel: IExpenseModel;
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
        if (isChartScreen) {
            return Object.keys(collection);
        }

        if (chartHelper.isChartScreen) {
            const model = {
                sales: chartHelper.salesModel,
                expenses: chartHelper.expensesModel
            };

            const permittedFields = [];

            // prop: i.e. 'location'
            // field: i.e 'location.name'
            // model[schemaName]: i.e. sales, expenses
            Object.keys(collection).forEach(prop => {
                const field = collection[prop];
                // check if field exists in collection
                model[schemaName].findOne({ [field]: { $exists: true } }).then(res => {
                    if (res) {
                        // if field exists push the key from collection
                        permittedFields.push(prop);
                    }
                });
            });

            return permittedFields;
        }
    }

}