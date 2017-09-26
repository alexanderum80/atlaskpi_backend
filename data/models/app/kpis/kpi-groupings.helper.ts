import { DataSourcesHelper } from './../../../queries/app/data-sources/datasource.helper';
import { KPIExpressionHelper } from './kpi-expression.helper';
import { GroupingMap } from './../../../queries/app/charts/chart-grouping-map';
import { IKPIDocument, KPITypeTable, KPITypeEnum, IKPISimpleDefinition } from './IKPI';
import * as _ from 'lodash';

export class KPIGroupingsHelper {
    public static GetAvailableGroupings(kpi: IKPIDocument): string[] {
        const identifier = kpi.baseKpi || kpi.code;
        const byIdentifierGroupings  = this._getGroupungsByIdentifier(identifier || null);

        let bySimpleKPIGroupings;

        if (kpi.type && KPITypeTable[kpi.type] === KPITypeEnum.Simple) {
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