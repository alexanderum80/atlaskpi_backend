import * as Promise from 'bluebird';
import {
    IIdentity
} from '../../common';
import {
    IBusinessUnitDocument,
    IBusinessUnitModel
} from '../business-unit.model';

export class BusinessUnitsQuery {
    constructor(public identity: IIdentity, private _IBusinessUnitModel: IBusinessUnitModel) {}

    run(data: any): Promise < IBusinessUnitDocument[] > {
        return this._IBusinessUnitModel.businessUnits();
    }
}