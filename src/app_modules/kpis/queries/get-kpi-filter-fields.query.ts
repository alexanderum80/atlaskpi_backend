import {DataSourceField, DataSourceFilterFieldsInput} from '../../data-sources/data-sources.types';
import {GraphQLTypesMap} from '../../../framework/decorators/graphql-types-map';
import * as BlueBird from 'bluebird';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import {DataSourcesService} from '../../../services/data-sources.service';
import {GetKpiFilterFieldsActivity} from '../activities/get-kpi-filter-fields.activity';

@injectable()
@query({
    name: 'kpiFilterFields',
    activity: GetKpiFilterFieldsActivity,
    parameters: [
        { name: 'input', type: DataSourceFilterFieldsInput }
    ],
    output: { type: DataSourceField, isArray: true }
})
export class GetKpiFilterFields implements IQuery<DataSourceField[]> {

    constructor(@inject(DataSourcesService.name) private _dataSourceSvc: DataSourcesService) {}

    async run(data: { input: DataSourceFilterFieldsInput }): Promise<DataSourceField[]> {
        if (isEmpty(data) || isEmpty(data.input)) {
            return [];
        }

        const input: DataSourceFilterFieldsInput = data.input;

        return await this._dataSourceSvc.getKPIFilterFieldsWithData(
            input.dataSource,
            input.collectionSource,
            input.fields
        );
    }
}