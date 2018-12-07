import { inject, injectable } from 'inversify';

import { CurrentUser } from '../../../domain/app/current-user';
import { GoogleAnalytics } from '../../../domain/app/google-analytics/google-analytics.model';
import { IKPIDocument, KPITypeEnum } from '../../../domain/app/kpis/kpi';
import { KPIs } from '../../../domain/app/kpis/kpi.model';
import { IVirtualSourceDocument } from '../../../domain/app/virtual-sources/virtual-source';
import { VirtualSources } from '../../../domain/app/virtual-sources/virtual-source.model';
import { getGenericModel } from '../../../domain/common/fields-with-data';
import { CurrentAccount } from '../../../domain/master/current-account';
import { GoogleAnalyticsKPIService } from '../../../services/kpis/google-analytics-kpi/google-analytics-kpi.service';
import { GAJobsQueueService } from '../../../services/queues/ga-jobs-queue.service';
import { isValidTimezone } from './../../../domain/common/date-range';
import { CompositeKpi } from './compound.kpi';
import { Expenses as ExpensesKPI } from './expenses.kpi';
import { GoogleAnalyticsKpi } from './google-analytics-kpi';
import { IKpiBase } from './kpi-base';
import { Revenue } from './revenue.kpi';
import { SimpleKPI } from './simple-kpi';
import { VirtualSourceAggregateService } from '../../../domain/app/virtual-sources/vs-aggregate.service';

@injectable()
export class KpiFactory {

    constructor(
        @inject('KPIs') private _kpis: KPIs,
        @inject(GoogleAnalytics.name) private _googleAnalytics: GoogleAnalytics,
        @inject(VirtualSources.name) private _virtualSources: VirtualSources,
        @inject(GoogleAnalyticsKPIService.name) private _googleAnalyticsKpiService: GoogleAnalyticsKPIService,
        @inject(GAJobsQueueService.name) private _queueService: GAJobsQueueService,
        @inject(CurrentAccount.name) private _currentAccount: CurrentAccount,
        @inject(CurrentUser.name) private _currentUser: CurrentUser,
        @inject(VirtualSourceAggregateService.name) private _vsAggregateService: VirtualSourceAggregateService
    ) { }

    async getInstance(kpiDocument: IKPIDocument): Promise<IKpiBase> {
        const virtualSources: IVirtualSourceDocument[] = await this._virtualSources.model.find({});

        const tz = this._currentUser.get().profile.timezone;

        if (!isValidTimezone(tz)) throw new Error('Invalid user timezone');

        if (!kpiDocument) { return null; }

        if (kpiDocument.type) {

            switch (kpiDocument.type) {
                case KPITypeEnum.Compound:
                    return new CompositeKpi(kpiDocument, this, this._kpis, tz);
                case KPITypeEnum.Complex:
                    return new CompositeKpi(kpiDocument, this, this._kpis, tz);
                case KPITypeEnum.Simple:
                    return SimpleKPI.CreateFromExpression(
                                kpiDocument,
                                virtualSources,
                                tz,
                                this._vsAggregateService
                          );
                case KPITypeEnum.ExternalSource:
                    return GoogleAnalyticsKpi.CreateFromExpression( kpiDocument,
                                                                    this._googleAnalytics,
                                                                    this._googleAnalyticsKpiService,
                                                                    this._queueService,
                                                                    this._currentAccount,
                                                                    virtualSources,
                                                                    this._vsAggregateService);
            }

        }

        const searchBy = kpiDocument.baseKpi || kpiDocument.code;

        switch (searchBy) {
            case 'Revenue':
                const vsSales = virtualSources.find(vs => vs.name === 'sale');
                const saleModel = getGenericModel(vsSales.db, vsSales.modelIdentifier, vsSales.source);
                return new Revenue(saleModel as any);
            case 'Expenses':
                const vsExpense = virtualSources.find(vs => vs.name === 'expenses');
                const expenseModel = getGenericModel(vsExpense.db, vsExpense.modelIdentifier, vsExpense.source);
                return new ExpensesKPI(expenseModel as any, virtualSources);
            default:
                return null;
        }
    }

}