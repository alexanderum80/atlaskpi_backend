import { IBusinessUnit, IBusinessUnitModel } from '../../../';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IPagedQueryResult} from '../../../';

export class ListAllBusinessUnitsQuery implements IQuery<IPagedQueryResult<IBusinessUnit>> {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          f
    constructor(public identity: IIdentity,
                private _BusinessUnitModel: IBusinessUnitModel) { }

    // log = true;
    // audit = true;

    run(data: any): Promise<IPagedQueryResult<IBusinessUnit>> {
        // details object inside graphql data object
        return this._BusinessUnitModel.allBusinessUnits(data.details);
    }
}
