import * as BlueBird from 'bluebird';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';

import { DataSourcesService } from '../../../services/data-sources.service';
import { DataSourceField } from '../../data-sources/data-sources.types';
import {GetKpiExpressionFieldsActivity} from '../activities/get-kpi-expression-fields.activity';
import {KPIExpressionFieldInput} from '../kpis.types';

@injectable()
@query({
    name: 'kpiExpressionFields',
    activity: GetKpiExpressionFieldsActivity,
    parameters: [
        { name: 'input', type: KPIExpressionFieldInput }
    ],
    output: { type: DataSourceField, isArray: true }
})
export class GetKpiExpressionFieldsQuery implements IQuery<DataSourceField[]> {
    constructor(@inject(DataSourcesService.name) private _dataSourceSvc: DataSourcesService) {}

    async run(data: { input: any }): Promise<DataSourceField[]> {
        if (isEmpty(data) || isEmpty(data.input)) {
            return [];
        }

        const input = data.input;
        return await this._dataSourceSvc.getExpressionFieldsWithData(input);
    }
}