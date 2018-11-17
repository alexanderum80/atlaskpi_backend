import { uniq, uniqBy } from 'lodash';
import { KpisSourcesMapsActivity } from './../activities/kpis-sourcesMaps.activity';
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
import { KPI } from '../kpis.types';

@injectable()
@query({
    name: 'KpisSourcesMaps',
    activity: KpisSourcesMapsActivity,
    output: { type: KPI, isArray: true }
})
export class KpiSourcesMapQuery implements IQuery<Object> {

    constructor(@inject(KPIs.name) private _kpis: KPIs,
                @inject(AppConnection.name) private _appConnection: AppConnection,
                @inject(KpiService.name) private _kpiservice: KpiService,
                @inject(VirtualSources.name) private _virtualSources: VirtualSources,
                @inject(Connectors.name) private _connectors: Connectors) { }

    async run(data: {}): Promise<Object> {

        const allKpis: IKPIDocument[] = await this._kpis.model.find({});
        const connectors: IConnectorDocument[] = await this._connectors.model.find({});
        const vs: IVirtualSourceDocument[] = await this._virtualSources.model.find({});
        const searchPromises: Promise<any>[] = [];
        const uniqVS = uniq(vs.map(v => { return v.source; }));
        uniqVS.forEach(s => {
            const theModel = this.getModel(s);
            searchPromises.push(this.getFields(theModel));
        });

        return new Promise<Object>((resolve, reject) => {
            let kpiResult: IKPIDocument[] = [];
            Promise.all(searchPromises).then(res => {
                const sourcesAllowed = res.filter(f => f.result === true);
                 allKpis.forEach(kpi => {
                    const kpiSources: string[] = this._kpiservice._getKpiSources(kpi, allKpis, connectors);
                    const virtualSources: IVirtualSourceDocument[] = vs.filter((v: IVirtualSourceDocument) => {
                        return kpiSources.indexOf(v.name.toLocaleLowerCase()) !== -1;
                    });
                    let matchCondition = false;
                    virtualSources.map(v => {
                        if (sourcesAllowed.find(sa => sa.collection === v.source)) { matchCondition = true; }
                    });
                    if (matchCondition) { kpiResult.push(kpi); }
                });
                resolve(kpiResult);
            })
            .catch(err => {
                reject(err);
            });
        });
    }

    private getModel(source: string): any {
        const schema = new mongoose.Schema({}, { strict: false });
        const connection: mongoose.Connection = this._appConnection.get;
        return connection.model(source, schema, source);
    }

    private getFields(model: any): Promise<any> {

        return new Promise<any>((resolve, reject) => {
            const parameters = [
                { '$match' : {
                        '$or' : [ { 'customer.zip' : { '$exists' : true } },
                            { 'location.zip' : { '$exists' : true } } ] }
                },
                {
                    '$group' : { '_id' : null, 'first' : { '$first' : '$_id' } }
                }
            ];
            const agg = model.aggregate(parameters);
            agg.options = { allowDiskUse: true };
            agg.then(result => {
                const exitResult = result && result[0] ? true : false;
                return resolve({collection: model.collection.collectionName, result: exitResult});
            })
            .catch(err => {
                reject(err);
            });
        });
    }
}
