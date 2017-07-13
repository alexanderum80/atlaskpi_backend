import { IKPIModel, IKPI } from '../../../models/app/kpis';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IUserModel, IPaginationDetails, IPagedQueryResult } from '../../../';

export class GetAllKPIsQuery implements IQuery<IPagedQueryResult<IKPI>> {

    constructor(
        public identity: IIdentity,
        private _KPIModel: IKPIModel) { }

    // log = true;
    // audit = true;

    run(data: IPaginationDetails): Promise<IPagedQueryResult<IKPI>> {
        return this._KPIModel.getAllKPIs(data);
    }
}
