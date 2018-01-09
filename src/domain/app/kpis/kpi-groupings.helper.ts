import { KpiService } from '../../../services/kpi.service';
import { GroupingMap } from '../../../app_modules/charts/queries/chart-grouping-map';
import { DataSourcesHelper } from '../../../app_modules/data-sources/queries/datasource.helper';
import { IKPIDocument, IKPISimpleDefinition, KPITypeEnum, IKPI } from './kpi';
import { KPIExpressionHelper } from './kpi-expression.helper';
import * as Promise from 'bluebird';

export class KPIGroupingsHelper {
    static kpiService: KpiService;
    public static GetAvailableGroupings(kpi: IKPIDocument | IKPI): string[] {
        const identifier = kpi.baseKpi || kpi.code;
        this.kpiService = (<any>kpi).model.prototype.kpiService;

        const byIdentifierGroupings  = this._getGroupungsByIdentifier(identifier || null);

        let bySimpleKPIGroupings;

        if (kpi.type && kpi.type === KPITypeEnum.Simple) {
            bySimpleKPIGroupings = this._getGroupingsForSimpleKPI(kpi.expression);
        }

        return byIdentifierGroupings || bySimpleKPIGroupings || [];
    }

    // This function it's no dynamic, is just mapping the predefined kpis
    // to the groping table on the chart-grouping-map file.
    private static _getGroupungsByIdentifier(code: string): string[]|Promise<string[]> {
        if (!code) return null;

        switch (code) {
            case 'Revenue':
                return this.kpiService.GetGroupingsExistInCollectionSchema(code);

            case 'Expenses':
                return this.kpiService.GetGroupingsExistInCollectionSchema(code);

            default:
                return null;
        }
    }

    private static _getGroupingsForSimpleKPI(expression: string) {
        const definition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, expression);
        return DataSourcesHelper.GetGroupingsForSchema(definition.dataSource);
    }
}