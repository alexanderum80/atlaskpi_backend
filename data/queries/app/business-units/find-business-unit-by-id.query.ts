import { IBusinessUnitDocument, IBusinessUnitModel  } from '../../../models/app';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IQueryResponse } from '../../../';

export class FindBusinessUnitByIdQuery implements IQueryResponse<IBusinessUnitDocument> {

    constructor(public identity: IIdentity,
                private _BusinessUnitModel: IBusinessUnitModel) { }

    // log = true;
    // audit = true;

    run(data: any): Promise<IQueryResponse<IBusinessUnitDocument>> {
        return this._BusinessUnitModel.findBusinessUnitById(data.id);
    }
}
