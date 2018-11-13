import { isArray } from 'lodash';
import { IKPI, IKPIDocument, KPITypeEnum } from './../../../domain/app/kpis/kpi';
import { GetKpiFilterExpressionActivity } from './../activities/get-kpi-filter-expression.activity';
import { inject, injectable } from 'inversify';

import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { DataSourcesService } from '../../../services/data-sources.service';
import { KPICriteriaResult, KPIFilterCriteria, KPI } from '../kpis.types';
import { KpiService } from '../../../services/kpi.service';


@injectable()
@query({
    name: 'kpiFilterExpression',
    activity: GetKpiFilterExpressionActivity,
    parameters: [
        { name: 'input', type: String }
    ],
    output: { type: KPI, isArray: true }
})
export class GetKpisFilterExpressionQuery implements IQuery<IKPIDocument[]> {
    constructor(
        @inject(KpiService.name) private _kpiSvc: KpiService
    ) {}

    async run(data: { input: string }): Promise<IKPIDocument[]> {
        const input = JSON.parse(data.input);

        let kpiType = KPITypeEnum.Simple;

        switch (input.type) {
            case 'complex':
                kpiType = KPITypeEnum.Complex;
                break;
            case 'compound':
                kpiType = KPITypeEnum.Compound;
                break;
            case 'externalsource':
                kpiType = KPITypeEnum.ExternalSource;
                break;
        }

        try {
            const kpis = await this._kpiSvc.getKpiByFilterExpression(
                kpiType,
                input.expression,
                input.filter || null
            );
            return kpis;
        } catch (error) {
            console.log(error);
            return error;
        }
    }
}