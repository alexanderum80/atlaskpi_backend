import { GroupingMap } from '../charts';
import { flatten, readMongooseSchema } from '../../../../lib/utils';
import { ExpenseSchema } from './../../../models/app/expenses/Expenses';
import { SaleSchema } from '../../../models/app/sales';
import * as mongoose from 'mongoose';

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

}