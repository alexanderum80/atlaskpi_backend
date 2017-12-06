import { SimpleKPI } from './simple-kpi';
import { IKpiBase } from './kpi-base';
import { CompositeKpi } from './compound.kpi';
import { Expenses } from './expenses.kpi';
import { Revenue } from './revenue.kpi';
import { IKPIDocument, KPITypeMap, KPITypeEnum, Sales } from '../../../domain/app/index';


export class KpiFactory {

    static getInstance(kpiDocument: IKPIDocument, sales: Sales, expenses: Expenses): IKpiBase {
        if (kpiDocument.type && KPITypeMap[kpiDocument.type] === KPITypeEnum.Compound)
            // TODO: Refactor this
            return new CompositeKpi(kpiDocument, ctx);

        if (kpiDocument.type && KPITypeMap[kpiDocument.type] === KPITypeEnum.Simple) {
            // TODO: Refactor this
            return SimpleKPI.CreateFromExpression(ctx, kpiDocument);
        }

        const searchBy = kpiDocument.baseKpi || kpiDocument.code;

        switch (searchBy) {
            case 'Revenue':
                return new Revenue(sales.model);
            case 'Expenses':
                return new Expenses(expenses.model);
            default:
                return null;
        }
    }

}