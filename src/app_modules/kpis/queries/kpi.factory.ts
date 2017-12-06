import { Expenses, IKPIDocument, KPITypeEnum, KPITypeMap, Sales } from '../../../domain';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { CompositeKpi } from './compound.kpi';
import { Expenses as ExpensesKPI } from './expenses.kpi';
import { IKpiBase } from './kpi-base';
import { Revenue } from './revenue.kpi';
import { SimpleKPI } from './simple-kpi';

export class KpiFactory {

    static getInstance(kpiDocument: IKPIDocument, kpis: KPIs, sales: Sales, expenses: Expenses): IKpiBase {
        if (kpiDocument.type && KPITypeMap[kpiDocument.type] === KPITypeEnum.Compound) {
            // TODO: Refactor this
            return new CompositeKpi(kpiDocument, kpis, sales, expenses);
        }

        if (kpiDocument.type && KPITypeMap[kpiDocument.type] === KPITypeEnum.Simple) {
            // TODO: Refactor this
            return SimpleKPI.CreateFromExpression(kpiDocument, sales, expenses);
        }

        const searchBy = kpiDocument.baseKpi || kpiDocument.code;

        switch (searchBy) {
            case 'Revenue':
                return new Revenue(sales.model);
            case 'Expenses':
                return new ExpensesKPI(expenses.model);
            default:
                return null;
        }
    }

}