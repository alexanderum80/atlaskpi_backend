import { KPIExpressionHelper } from '../../../models/app/kpis/kpi-expression.helper';
import { QueryBase } from '../../query-base';
import { IKPIModel, IKPI } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IAppModels } from '../../../models/app/app-models';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class GetKpisQuery extends QueryBase<IKPI[]> {

    constructor(
        public identity: IIdentity,
        private _ctx: IAppModels) {
            super(identity);
        }

    // log = true;
    // audit = true;

    run(data: IPaginationDetails): Promise<IKPI[]> {
        const that = this;
        return new Promise<IKPI[]>((resolve, reject) => {
             return that._ctx.KPI
                   .find()
                   .then((kpis) => {
                       kpis.forEach(k => {
                           k.expression = KPIExpressionHelper.PrepareExpressionField(k.type, k.expression);
                       });
                       resolve(kpis);
                   })
                   .catch(e => reject(e));
        });

    }
}
