import { ISlideshowModel } from '../../../models/app/slideshow';
import { ISlideshowDocument } from '../../../models/app/slideshow';
import { IQueryResponse } from '../../../models/common';
import { IAppModels } from '../../../models/app/app-models';
import * as Promise from 'bluebird';
import { IQuery } from '../..';
import { IIdentity } from '../../../';

export class SlideshowByIdQuery {
    constructor(public identity: IIdentity, private _ISlideshowModel: ISlideshowModel) {}

    run(data: any): Promise<ISlideshowDocument> {
        return this._ISlideshowModel.slideshowById(data._id);
    }
}