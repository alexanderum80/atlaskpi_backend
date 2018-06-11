import { COGS } from './../../../domain/app/cogs/cogs.model';
import { Payments } from './../../../domain/app/payments/payment.model';
import { inject, injectable } from 'inversify';

import { Calls } from '../../../domain/app/calls/call.model';
import { Expenses } from '../../../domain/app/expenses/expense.model';
import { GoogleAnalytics } from '../../../domain/app/google-analytics/google-analytics.model';
import { IKPIDocument, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { Sales } from '../../../domain/app/sales/sale.model';
import { IVirtualSourceDocument } from '../../../domain/app/virtual-sources/virtual-source';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';
import { GoogleAnalyticsKPIService } from '../../../services/kpis/google-analytics-kpi/google-analytics-kpi.service';
import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { Inventory } from './../../../domain/app/inventory/inventory.model';
import { CompositeKpi } from './compound.kpi';
import { Expenses as ExpensesKPI } from './expenses.kpi';
import { GoogleAnalyticsKpi } from './google-analytics-kpi';
import { IKpiBase } from './kpi-base';
import { Revenue } from './revenue.kpi';
import { SimpleKPI } from './simple-kpi';
import { GAJobsQueueService } from '../../../services/queues/ga-jobs-queue.service';
import { CurrentAccount } from '../../../domain/master/current-account';

@injectable()
export class KpiFactory {

    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject(Sales.name) private _sales: Sales,
        @inject(Expenses.name) private _expenses: Expenses,
        @inject(Inventory.name) private _inventory: Inventory,
        @inject(Calls.name) private _calls: Calls,
        @inject(GoogleAnalytics.name) private _googleAnalytics: GoogleAnalytics,
        @inject(Appointments.name) private _appointments: Appointments,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(Payments.name) private _payments: Payments,
        @inject(COGS.name) private _cogs: COGS,
        @inject(GoogleAnalyticsKPIService.name) private _googleAnalyticsKpiService: GoogleAnalyticsKPIService,
        @inject(GAJobsQueueService.name) private _queueService: GAJobsQueueService,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
    ) { }

    async getInstance(kpiDocument: IKPIDocument): Promise<IKpiBase> {
        const virtualSources: IVirtualSourceDocument[] = await this._virtualSources.model.find({});

        if (!kpiDocument) { return null; }

        if (kpiDocument.type) {

            switch (kpiDocument.type) {
                case KPITypeEnum.Compound:
                    return new CompositeKpi(kpiDocument, this, this._kpis);
                case KPITypeEnum.Complex:
                    return new CompositeKpi(kpiDocument, this, this._kpis);
                case KPITypeEnum.Simple:
                    return SimpleKPI.CreateFromExpression(
                                kpiDocument,
                                this._sales,
                                this._expenses,
                                this._inventory,
                                this._calls,
                                this._appointments,
                                this._payments,
                                this._cogs,
                                virtualSources
                          );
                case KPITypeEnum.ExternalSource:
                    return GoogleAnalyticsKpi.CreateFromExpression( kpiDocument,
                                                                    this._googleAnalytics,
                                                                    this._googleAnalyticsKpiService,
                                                                    this._queueService,
                                                                    this._currentAccount,
                                                                    virtualSources);
            }

        }

        const searchBy = kpiDocument.baseKpi || kpiDocument.code;

        switch (searchBy) {
            case 'Revenue':
                return new Revenue(this._sales.model);
            case 'Expenses':
                return new ExpensesKPI(this._expenses.model, virtualSources);
            default:
                return null;
        }
    }

}