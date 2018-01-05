import { Inventory } from './../../../domain/app/inventory/inventory.model';
import { Sales } from '../../../domain/app/sales/sale.model';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { IKPIDocument, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { CompositeKpi } from './compound.kpi';
import { Expenses as ExpensesKPI } from './expenses.kpi';
import { IKpiBase } from './kpi-base';
import { Revenue } from './revenue.kpi';
import { SimpleKPI } from './simple-kpi';
import { injectable, inject } from 'inversify';
import { GoogleAnalytics } from '../../../domain/app/google-analytics/google-analytics.model';

@injectable()
export class KpiFactory {

    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject(Sales.name) private _sales: Sales,
        @inject(Expenses.name) private _expenses: Expenses,
        @inject(Inventory.name) private _inventory: Inventory,
        @inject(GoogleAnalytics.name) private _googleanalytics: GoogleAnalytics,
    ) { }

    getInstance(kpiDocument: IKPIDocument): IKpiBase {

        if (!kpiDocument) { return null; }

        if (kpiDocument.type && kpiDocument.type === KPITypeEnum.Compound) {
            // TODO: Refactor this
            return new CompositeKpi(kpiDocument, this, this._kpis);
        }

        if (kpiDocument.type && kpiDocument.type === KPITypeEnum.Simple) {
            // TODO: Refactor this
            return SimpleKPI.CreateFromExpression(  kpiDocument,
                                                    this._sales,
                                                    this._expenses,
                                                    this._inventory,
                                                    this._googleanalytics);
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