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
import { GetKpiOldestDateActivity } from '../activities/get-kpi-oldestDate.activity';
import { IKPIDocument } from '../../../domain/app/kpis/kpi';
import { IConnectorDocument } from '../../../domain/master/connectors/connector';
import * as moment from 'moment';

@injectable()
@query({
    name: 'getKpiOldestDate',
    cache: { ttl: 1800 },
    activity: GetKpiOldestDateActivity,
    parameters: [
        { name: 'id', type: String },
    ],
    output: { type: String }
})
export class GetKpiOldestDateQuery implements IQuery<Object> {

    constructor(@inject(KPIs.name) private _kpis: KPIs,
        @inject(AppConnection.name) private _appConnection: AppConnection,
        @inject(KpiService.name) private _kpiservice: KpiService,
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
        const searchPromises: Promise<Object>[] = [];
        virtualSources.map(s => {
            const theModel = this.getModel(s.name, s.source);
            searchPromises.push(this.getOldDestYear(theModel, s.dateField));
        });
        return new Promise<Object>((resolve, reject) => {
            Promise.all(searchPromises).then(res => {
                let result: number[] = [];
                let endResult;
                res.map(r => {
                    // this happens with google analytics the response is a []
                    if (Object.values(r).length < 1 || 
                        (Object.values(r).length === 1 && Object.values(r[0]).length === 0)) {
                        //assign a fixed value up to 3 years in the past
                        endResult = moment().year() - 3;
                    }
                    else {
                        const yearTMP = moment(r[0].oldestDate).year();
                        result.push(yearTMP);
                    }
                });

                if(!endResult){
                result = result.sort();
                endResult = result[result.length - 1];
                }
                resolve(endResult);
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
    private getOldDestYear(model: any, dateField: string): Promise<Object> {

        return new Promise<Object>((resolve, reject) => {
            const parameters = [];
            const paramstr = '{"$match":{"' + dateField + '":{"$exists":true}}}';
            const sortstr = '{"$sort":{"' + dateField + '":1}}';
            const groupstr = '{"$group":{"_id":null,"oldestDate":{"$first":"$' + dateField + '" }}}';
            parameters.push(JSON.parse(paramstr));
            parameters.push(JSON.parse(sortstr));
            parameters.push(JSON.parse(groupstr));
            const agg = model.aggregate(parameters);
            agg.options = { allowDiskUse: true };
            agg.then(result => {
                resolve(result);
                return;
            })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
