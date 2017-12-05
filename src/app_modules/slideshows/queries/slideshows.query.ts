import { ISlideshowDocument } from '../../../domain/app/slideshow';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Slideshows } from '../../../domain';
import { Slideshow } from '../slideshows.types';
import { SlideshowByIdActivity } from '../activities';

@injectable()
@query({
    name: 'slideshows',
    activity: SlideshowByIdActivity,
    output: { type: Slideshow, isArray: true }
})
export class SlideshowsQuery extends QueryBase<ISlideshowDocument[]> {
    constructor(@inject('Slideshows') private _slideshows: Slideshows) {
        super();
    }

    run(data: { _id: string }): Promise<ISlideshowDocument[]> {
        return this._slideshows.model.slideshows();
    }
}
