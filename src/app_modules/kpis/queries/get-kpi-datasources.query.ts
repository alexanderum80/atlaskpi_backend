import { isArray } from 'util';
import { AppConnection } from './../../../domain/app/app.connection';
import * as mongoose from 'mongoose';
import { VirtualSources } from './../../../domain/app/virtual-sources/virtual-source.model';
import { IVirtualSourceDocument } from './../../../domain/app/virtual-sources/virtual-source';
import { Connectors } from './../../../domain/master/connectors/connector.model';
import { KpiService } from './../../../services/kpi.service';
import { KPIs } from './../../../domain/app/kpis/kpi.model';
import { inject, injectable } from 'inversify';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import * as moment from 'moment';
import { GetKpiDatasourcesActivity } from '../activities/get-kpi-datasources.activity';

@injectable()
@query({
    name: 'getKpiDataSources',
    activity: GetKpiDatasourcesActivity,
    parameters: [
        { name: 'id', type: String },
        { name: 'zipField', type: String }
    ],
    output: { type: Boolean, isArray: true }
})
export class GetKpiDataSourcesQuery implements IQuery<Object> {

    constructor(@inject(KPIs.name) private _kpis: KPIs,
                @inject(AppConnection.name) private _appConnection: AppConnection,
                @inject(KpiService.name) private _kpiservice: KpiService,
                @inject(VirtualSources.name) private _virtualSources: VirtualSources,
                @inject(Connectors.name) private _connectors: Connectors) { }

    async run(data: { id: string, zipField: string }): Promise<Object> {

        const allKpis: IKPIDocument[] = await this._kpis.model.find({});
        const kpi: IKPIDocument = allKpis.find((k: IKPIDocument) => k.id === data.id);
        const connectors: IConnectorDocument[] = await this._connectors.model.find({});
        const kpiSources: string[] = this._kpiservice._getKpiSources(kpi, allKpis, connectors);
        const vs: IVirtualSourceDocument[] = await this._virtualSources.model.find({});
        const virtualSources: IVirtualSourceDocument[] = vs.filter((v: IVirtualSourceDocument) => {
            return kpiSources.indexOf(v.name.toLocaleLowerCase()) !== -1;
        });
        const searchPromises: Promise<Object>[] = [];
        virtualSources.map( s => {
            const theModel = this.getModel(s.name, s.source);
            searchPromises.push(this.getFields(theModel, data.zipField));
        });
        return new Promise<Object>((resolve, reject) => {
            Promise.all(searchPromises).then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            });
        });
    }
    private getModel(modelName: string, source: string): any {
        const schema = new mongoose.Schema({}, { strict: false });
        const connection: mongoose.Connection = this._appConnection.get;
        const model = connection.model(modelName, schema, source);
        return model;
    }
    private getFields(model: any, zipField: string): Promise<Object> {

        return new Promise<Object>((resolve, reject) => {
            const parameters = [
                { '$match' : { [zipField] : { '$exists' : true }}
                },
                {
                    '$group' : { '_id' : null, 'first' : { '$first' : '$_id' } }
                }
            ];
            const agg = model.aggregate(parameters);
            agg.options = { allowDiskUse: true };
            agg.then(result => {
                const exitResult = result && result[0] ? true : false;
                resolve(exitResult);
                return;
            })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
