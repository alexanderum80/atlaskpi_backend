import {
    IIdentity,
    QueryBase
} from '../../../framework';
import {
    IBusinessUnitDocument,
    IBusinessUnitModel
} from '../business-unit.model';
import * as Promise from 'bluebird';

export class BusinessUnitByIdQuery extends QueryBase < IBusinessUnitDocument > {
    constructor(public identity: IIdentity, private _IBusinessUnitModel: IBusinessUnitModel) {
        super(identity);
    }

    run(data: any): Promise < IBusinessUnitDocument > {
        return this._IBusinessUnitModel.businessUnitById(data.id);
    }
}