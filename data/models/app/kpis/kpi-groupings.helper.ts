import { DataSourcesHelper } from './../../../queries/app/data-sources/datasource.helper';
import { KPIExpressionHelper } from './kpi-expression.helper';
import { GroupingMap } from './../../../queries/app/charts/chart-grouping-map';
import { IKPIDocument, KPITypeMap, KPITypeEnum, IKPISimpleDefinition } from './IKPI';


const codeMapper = {
    'Revenue': 'sales',
    'Expenses': 'expenses'
};

export class KPIGroupingsHelper {
    public static GetAvailableGroupings(kpi: IKPIDocument, kpiService?: any): string[] {
        const identifier = kpi.baseKpi || kpi.code;
        const byIdentifierGroupings  = this._getGroupingsByIdentifier(identifier || null, kpiService);

        let bySimpleKPIGroupings;

        if (kpi.type && KPITypeMap[kpi.type] === KPITypeEnum.Simple) {
            bySimpleKPIGroupings = this._getGroupingsForSimpleKPI(kpi.expression, GroupingMap, kpiService);
        }

        return byIdentifierGroupings || bySimpleKPIGroupings || [];
    }

    // This function it's no dynamic, is just mapping the predefined kpis
    // to the groping table on the chart-grouping-map file.
    private static _getGroupingsByIdentifier(code: string, kpiService?: any): any {
        if (!code) return null;

        switch (code) {
            case 'Revenue':
                return DataSourcesHelper.GetGroupingsExistInCollectionSchema(codeMapper[code], GroupingMap, kpiService);

            case 'Expenses':
                return DataSourcesHelper.GetGroupingsExistInCollectionSchema(codeMapper[code], GroupingMap, kpiService);

            case 'Inventory':
                return Object.keys(GroupingMap.inventory);

            default:
                return null;
        }
    }

    private static _getGroupingsForSimpleKPI(expression: string, GroupingMap: any, kpiService: any) {
        const definition: IKPISimpleDefinition = KPIExpressionHelper.DecomposeExpression(KPITypeEnum.Simple, expression);
        return DataSourcesHelper.GetGroupingsExistInCollectionSchema(definition.dataSource, GroupingMap, kpiService);
    }
}