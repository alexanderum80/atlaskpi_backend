import * as BlueBird from 'bluebird';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

import { DataSourcesService } from '../../../services/data-sources.service';
import { DataSourceField } from '../../data-sources/data-sources.types';
import {GetKpiNumericFieldsActivity} from '../activities/get-kpi-numeric-fields.activity';
import {KPIExpressionFieldInput} from '../kpis.types';

@injectable()
@query({
    name: 'kpiExpressionNumericFields',
    activity: GetKpiNumericFieldsActivity,
    parameters: [
        { name: 'input', type: KPIExpressionFieldInput }
    ],
    output: { type: DataSourceField, isArray: true }
})
export class GetKpiNumericFieldsQuery implements IQuery<DataSourceField[]> {
    constructor(@inject(DataSourcesService.name) private _dataSourceSvc: DataSourcesService) {}

    async run(data: { input: any }): Promise<DataSourceField[]> {
        // get the virtual source numeric fields
        // get the fields that exist and has data
        // return those field

        // fields needed: source, collectionSource
        if (isEmpty(data) || isEmpty(data.input)) {
            return [];
        }

        const input = data.input;
        return await this._dataSourceSvc.getNumericFieldsWithData(input);
    }
}