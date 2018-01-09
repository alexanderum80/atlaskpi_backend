import { KpiService } from '../../../services/kpi.service';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetKpisActivity } from '../activities/get-kpis.activity';
import { KPI } from '../kpis.types';


@injectable()
@query({
    name: 'kpis',
    activity: GetKpisActivity,
    output: { type: KPI, isArray: true }
})
export class KpisQuery implements IQuery<IKPIDocument[]> {
    constructor(@inject(KpiService.name) private _kpiService: KpiService) { }

    run(data: { id: string }): Promise<IKPIDocument[]> {
        return new Promise<IKPIDocument[]>((resolve, reject) => {
            this._kpiService.listKpis(data.id).then(kpis => {
                resolve(kpis);
                return;
            }).catch(err => {
                reject(err);
            });
        });
    }
}

