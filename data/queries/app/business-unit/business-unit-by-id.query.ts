import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IBusinessUnitDocument, IBusinessUnitModel } from '../../../models/app/business-unit/IBusinessUnit';

export class BusinessUnitByIdQuery {
    constructor(public identity: IIdentity, private _IBusinessUnitModel: IBusinessUnitModel) {}

    run(data: any): Promise<IBusinessUnitDocument> {
        return this._IBusinessUnitModel.businessUnitById(data.id);
    }
}