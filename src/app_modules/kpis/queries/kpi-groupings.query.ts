import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import {IValueName} from '../../../domain/common/value-name';
import {ValueName} from '../../shared/shared.types';
import { KpiGroupingsInput } from '../kpis.types';
import {KpiService} from '../../../services/kpi.service';
import { isEmpty } from 'lodash';
import {KpiGroupingsActivity} from '../activities/kpi-groupings.activity';

@injectable()
@query({
    name: 'kpiGroupings',
    activity: KpiGroupingsActivity,
    parameters: [
        { name: 'input', type: KpiGroupingsInput }
    ],
    output: { type: ValueName, isArray: true}
})
export class KpiGroupingsQuery implements IQuery<IValueName[]> {
    constructor(@inject(KpiService.name) private _kpiSvc: KpiService) {}

    async run(data: { input: KpiGroupingsInput }): Promise<IValueName[]> {
        if (isEmpty(data) || isEmpty(data.input)) {
            return [];
        }

        const input = data.input;

        if (!input.ids || isEmpty(input.dateRange)) {
            return [];
        }

        return await this._kpiSvc.getGroupingsWithData(input);
    }
}