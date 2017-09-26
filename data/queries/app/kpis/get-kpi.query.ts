import { KPIExpressionHelper } from './../../../models/app/kpis/kpi-expression.helper';
import { IKPIDocument, KPITypeTable } from './../../../models/app/kpis/IKPI';
import { QueryBase } from '../../query-base';
import { IKPI, IKPIModel, KPITypeEnum } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IAppModels } from '../../../models/app/app-models';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class GetKpiQuery extends QueryBase<IKPIDocument> {

    constructor(
        public identity: IIdentity,
        private _KPIModel: IKPIModel) {
            super(identity);
    }

    // log = true;
    // audit = true;

    run(data: { id: string }): Promise<IKPIDocument> {
        console.log(data);
        const that = this;
        return new Promise<IKPIDocument>((resolve, reject) => {
            that._KPIModel
                .findOne({ _id: data.id })
                .then((kpiDocument) => {
                    resolve(kpiDocument);
                })
                .catch(e => reject(e));
        });
    }
}
