import { importSpreadSheet } from '../../../../data/google-spreadsheet/google-spreadsheet';
import { ImportResult } from '../google-spreedsheet.types';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { inject, injectable } from 'inversify';

@injectable()
@mutation({
    name: 'refreshDataFromSpreadSheet',
    parameters: [
        { name: 'customer', type: GraphQLTypesMap.String }
    ],
    output: { type: ImportResult, isArray: true }
})

export const refreshDataFromSpreadSheet = function(customer: string) {
    return importSpreadSheet;
};