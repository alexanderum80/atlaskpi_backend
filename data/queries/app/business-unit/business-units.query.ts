import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { IBusinessUnitDocument, IBusinesUnitModel } from '../../../models/app/business-unit/IBusinessUnit';

export class BusinessUnitsQuery {
    constructor(public identity: IIdentity, private _IBusinessUnitModel: IBusinesUnitModel) {}

    run(data: any): Promise<IBusinessUnitDocument[]> {
        return this._IBusinessUnitModel.businessUnits();
    }
}
