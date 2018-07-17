import { Appointments } from './../../../domain/app/appointments/appointment-model';
import { VirtualSources } from './../../../domain/app/virtual-sources/virtual-source.model';
import { IVirtualSourceDocument } from './../../../domain/app/virtual-sources/virtual-source';
import { Connectors } from './../../../domain/master/connectors/connector.model';
import { KpiService } from './../../../services/kpi.service';
import { KPIs } from './../../../domain/app/kpis/kpi.model';
import { COGS } from './../../../domain/app/cogs/cogs.model';
import { Expenses } from './../../../domain/app/expenses/expense.model';
import { Inventory } from './../../../domain/app/inventory/inventory.model';
import { Payments } from './../../../domain/app/payments/payment.model';
import { Sales } from './../../../domain/app/sales/sale.model';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { GetKpiOldestDateActivity } from '../activities/get-kpi-oldestDate.activity';
import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import * as moment from 'moment';

@injectable()
@query({
    name: 'getKpiOldestDate',
    activity: GetKpiOldestDateActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: String }
})
export class GetKpiOldestDateQuery implements IQuery<Object> {

    constructor(@inject(KPIs.name) private _kpis: KPIs,
                @inject(KpiService.name) private _kpiservice: KpiService,
                @inject(Expenses.name) private _expenses: Expenses,
                @inject(COGS.name) private _cogs: COGS,
                @inject(Inventory.name) private _inventory: Inventory,
                @inject(Payments.name) private _payments: Payments,
                @inject(Sales.name) private _sales: Sales,
                @inject(Appointments.name) private _appointments: Appointments,
                @inject(VirtualSources.name) private _virtualSources: VirtualSources,
                @inject(Connectors.name) private _connectors: Connectors) { }

    async run(data: { id: string }): Promise<Object> {

        const allKpis: IKPIDocument[] = await this._kpis.model.find({});
        const kpi: IKPIDocument = allKpis.find((k: IKPIDocument) => k.id === data.id);
        const connectors: IConnectorDocument[] = await this._connectors.model.find({});
        const kpiSources: string[] = this._kpiservice._getKpiSources(kpi, allKpis, connectors);
        const vs: IVirtualSourceDocument[] = await this._virtualSources.model.find({});
        const virtualSources: IVirtualSourceDocument[] = vs.filter((v: IVirtualSourceDocument) => {
            return kpiSources.indexOf(v.name.toLocaleLowerCase()) !== -1;
        });
        const sources = virtualSources.map( s => {
            return s.source.toLocaleLowerCase();
        });
        return new Promise<Object>((resolve, reject) => {

            const searchPromises: Promise<Object>[] = [
                sources.find(s => s === 'expenses') ? this._expenses.model.expensesOldestDate('expenses') : null,
                sources.find(s => s === 'cogs') ? this._cogs.model.cogsOldestDate('cogs') : null,
                sources.find(s => s === 'inventory') ? this._inventory.model.inventoryOldestDate('inventory') : null,
                sources.find(s => s === 'payments') ? this._payments.model.paymentOldestDate('payments') : null,
                sources.find(s => s === 'sales') ? this._sales.model.salesOldestDate('sales') : null,
                sources.find(s => s === 'appointments') ? this._appointments.model.appointmentsOldestDate('appointments') : null
            ];
            Promise.all(searchPromises).then(res => {
                const result: number[] = [];
                res.map(r => {
                    if (r !== null) {
                        const yearTMP = moment(r.data[0].oldestDate).year();
                        result.push(yearTMP);
                    }
                });
                let oldestResult = result[0];
                result.map(d => {
                    if (d > oldestResult) {
                        oldestResult = d;
                    }
                });
                resolve(oldestResult);
            })
            .catch(err => {
                reject(err);
            });
        });
    }
}