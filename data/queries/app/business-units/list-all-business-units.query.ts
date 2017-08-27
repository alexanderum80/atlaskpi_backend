import { QueryBase } from '../../query-base';
import { IBusinessUnit, IBusinessUnitModel } from '../../../';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity, IPagedQueryResult} from '../../../';

export class ListAllBusinessUnitsQuery extends QueryBase<IPagedQueryResult<IBusinessUnit>> {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                          f
    constructor(public identity: IIdentity,
                private _BusinessUnitModel: IBusinessUnitModel) {
                    super(identity);
                }

    // log = true;
    // audit = true;

    run(data: any): Promise<IPagedQueryResult<IBusinessUnit>> {
        // details object inside graphql data object
        return this._BusinessUnitModel.allBusinessUnits(data.details);
    }
}
