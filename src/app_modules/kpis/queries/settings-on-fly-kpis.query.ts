import { inject, injectable } from 'inversify';

import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { KpiService } from '../../../services/kpi.service';
import { SettingsOnFlyKpisActivity } from '../activities/settings-on-fly-kpis.activity';
import { KPI } from '../kpis.types';


@injectable()
@query({
    name: 'settingOnFlyKpis',
    activity: SettingsOnFlyKpisActivity,
    output: { type: KPI, isArray: true }
})
export class SettingsOnFlyKpisQuery implements IQuery<IKPIDocument[]> {
    constructor(
        @inject(KpiService.name) private _kpiService: KpiService) { }

    async run(data: { id: string }): Promise<IKPIDocument[]> {
        return await this._kpiService.getKpis();
    }
}
