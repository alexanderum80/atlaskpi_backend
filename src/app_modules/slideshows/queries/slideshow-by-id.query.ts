import { ISlideshowDocument } from '../../../domain/app/slideshow';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Slideshows } from '../../../domain';
import { Slideshow } from '../slideshows.types';
import { SlideshowByIdActivity } from '../activities';

@injectable()
@query({
    name: 'slideshowById',
    activity: SlideshowByIdActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: Slideshow }
})
export class SlideshowByIdQuery extends QueryBase<ISlideshowDocument> {
    constructor(@inject('Slideshows') private _slideshows: Slideshows) {
        super();
    }

    run(data: { _id: string }): Promise<ISlideshowDocument> {
        return this._slideshows.model.slideshowById(data._id);
    }
}
