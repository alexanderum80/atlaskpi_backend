import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourcesService } from '../../../services/data-sources.service';
import { GetKpiCriteriaActivity } from '../activities/get-kpi-criteria.activity';
import { KPICriteriaResult, KPIFilterCriteria } from '../kpis.types';


@injectable()
@query({
    name: 'kpiCriteria',
    activity: GetKpiCriteriaActivity,
    parameters: [
        { name: 'input', type: KPIFilterCriteria }
    ],
    output: { type: KPICriteriaResult }
})
export class GetKpisCriteriaQuery implements IQuery<KPICriteriaResult> {
    constructor(
        @inject(DataSourcesService.name) private _dataSourcesSvc: DataSourcesService
    ) {}

    async run(data: { input: KPIFilterCriteria }): Promise<KPICriteriaResult> {
        const input = data.input;

        try {
            const criteria = await this._dataSourcesSvc.getDistinctValues(
                input.name,
                input.source,
                input.field,
                input.limit,
                input.filter,
                input.collectionSource
            );
            return {
                criteriaValue: criteria.sort()
            };
        } catch (e) {
            return {
                criteriaValue: null,
                errors: [{ field: '', errors: ['An error ocurred while retrieving criterias'] }]
            };
        }

    }
}