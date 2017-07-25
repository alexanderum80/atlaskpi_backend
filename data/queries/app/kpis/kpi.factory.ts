import { IKpiBase } from './kpi-base';
import { CompositeKpi } from './compound.kpi';
import { Expenses } from './expenses.kpi';
import { Revenue } from './revenue.kpi';
import { IAppModels } from '../../../models/app/app-models';
import { IKPIDocument } from '../../../models/app/kpis';

export class KpiFactory {

    static getInstance(kpiDocument: IKPIDocument, ctx: IAppModels): IKpiBase {
        if (kpiDocument.composition)
            return new CompositeKpi(kpiDocument, ctx);

        const searchBy = kpiDocument.baseKpi || kpiDocument.code;

        switch (searchBy) {
            case 'Revenue':
                return new Revenue(ctx.Sale);
            case 'Expenses':
                return new Expenses(ctx.Expense);
            default:
                return null;
        }
    }

}