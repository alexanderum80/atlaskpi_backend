import * as Promise from 'bluebird';
import {
    IIdentity,
    QueryBase
} from '../../../framework';
import {
    IBusinessUnitDocument,
    IBusinessUnitModel
} from '../business-unit.model';

export class BusinessUnitsQuery extends QueryBase<IBusinessUnitDocument[]> {
    constructor(public identity: IIdentity, private _IBusinessUnitModel: IBusinessUnitModel) {
        super(identity);
    }

    run(data: any): Promise < IBusinessUnitDocument[] > {
        return this._IBusinessUnitModel.businessUnits();
    }
}
