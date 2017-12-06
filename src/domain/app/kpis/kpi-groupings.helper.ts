import { DataSourcesHelper } from '../../../app_modules/data-sources/queries/datasource.helper';
import { KPIExpressionHelper } from './kpi-expression.helper';
import { GroupingMap } from '../../../app_modules/charts/queries';
import { IKPIDocument, IKPISimpleDefinition, KPITypeEnum, KPITypeMap } from './';

export class KPIGroupingsHelper {
    public static GetAvailableGroupings(kpi: IKPIDocument): string[] {
        const identifier = kpi.baseKpi || kpi.code;
        const byIdentifierGroupings  = this._getGroupungsByIdentifier(identifier || null);

        let bySimpleKPIGroupings;

        if (kpi.type && KPITypeMap[kpi.type] === KPITypeEnum.Simple) {
            bySimpleKPIGroupings = this._getGroupingsForSimpleKPI(kpi.expression);
        }

        return byIdentifierGroupings || bySimpleKPIGroupings || [];
    }

    // This function it's no dynamic, is just mapping the predefined kpis
    // to the groping table on the chart-grouping-map file.
    private static _getGroupungsByIdentifier(code: string): string[] {
        if (!code) return null;

        switch (code) {
            case 'Revenue':
                return Object.keys(GroupingMap.sales);

            case 'Expenses':
                return Object.keys(GroupingMap.expenses);

            default:
                return null;
        }
    }

    private static _getGroupingsForSimpleKPI(expression: string) {
        const definition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, expression);
        return DataSourcesHelper.GetGroupingsForSchema(definition.dataSource);
    }
}