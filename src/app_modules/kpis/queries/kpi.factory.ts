import { Expenses, IKPIDocument, KPITypeMap, Sales } from '../../../domain';
import { KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { CompositeKpi } from './compound.kpi';
import { Expenses as ExpensesKPI } from './expenses.kpi';
import { IKpiBase } from './kpi-base';
import { Revenue } from './revenue.kpi';
import { SimpleKPI } from './simple-kpi';
import { injectable, inject } from 'inversify';

@injectable()
export class KpiFactory {

    constructor(
        @inject('Container') private _kpis: KPIs,
        @inject('Sales') private _sales: Sales,
        @inject(Expenses.name) private _expenses: Expenses,
    ) { }

    getInstance(kpiDocument: IKPIDocument): IKpiBase {
        if (kpiDocument.type && kpiDocument.type === KPITypeEnum.Compound) {
            // TODO: Refactor this
            return new CompositeKpi(kpiDocument, this, this._kpis);
        }

        if (kpiDocument.type && kpiDocument.type === KPITypeEnum.Simple) {
            // TODO: Refactor this
            return SimpleKPI.CreateFromExpression(kpiDocument, this._sales, this._expenses);
        }

        const searchBy = kpiDocument.baseKpi || kpiDocument.code;

        switch (searchBy) {
            case 'Revenue':
                return new Revenue(this._sales.model);
            case 'Expenses':
                return new ExpensesKPI(this._expenses.model);
            default:
                return null;
        }
    }

}