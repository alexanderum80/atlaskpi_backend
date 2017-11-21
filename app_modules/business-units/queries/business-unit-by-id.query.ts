import {
    IIdentity
} from '../../common';
import {
    IBusinessUnitDocument,
    IBusinessUnitModel
} from '../business-unit.model';
import * as Promise from 'bluebird';

export class BusinessUnitByIdQuery {
    constructor(public identity: IIdentity, private _IBusinessUnitModel: IBusinessUnitModel) {}

    run(data: any): Promise < IBusinessUnitDocument > {
        return this._IBusinessUnitModel.businessUnitById(data.id);
    }
}