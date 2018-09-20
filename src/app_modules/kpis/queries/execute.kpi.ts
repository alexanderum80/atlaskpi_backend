import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { IKPI } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { GraphQLTypesMap } from '../../../framework/decorators/graphql-types-map';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { ExecuteKpiActivity } from '../activities/execute-kpi.activity';
import { KPIAttributesInput } from '../kpis.types';
import { DataSourceResponse } from '../../data-sources/data-sources.types';
import { KpiFactory } from './kpi.factory';
import { parsePredefinedDate } from '../../../domain/common/date-range';

@injectable()
@query({
    name: 'executeKpi',
    activity: ExecuteKpiActivity,
    parameters: [
        { name: 'input', type: KPIAttributesInput, required: true },
    ],
    output: { type: DataSourceResponse, isArray: true }
})
export class ExecuteKpiQuery implements IQuery<DataSourceResponse> {

    constructor(@inject(KpiFactory.name) private _kpiFactory: KpiFactory) { }

    run(data: { input: KPIAttributesInput }): Promise<DataSourceResponse> {
        // debugger;
        // const instance = this._kpiFactory.getInstance(data.input as any);
        // instance.getData([parsePredifinedDate('all times')]).then(res => {
        //     console.log('data');
        // });
        return null;
    }
}
