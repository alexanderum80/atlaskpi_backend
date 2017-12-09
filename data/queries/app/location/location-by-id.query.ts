import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';
import { ILocationDocument, ILocationModel } from '../../../models/app/location/ILocation';

export class LocationByIdQuery {
    constructor(public identity: IIdentity, private _ILocationModel: ILocationModel) {}

    run(data: any): Promise<ILocationDocument> {
        return this._ILocationModel.locationById(data.id);
    }
}