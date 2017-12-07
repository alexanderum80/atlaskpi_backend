import { ISlideshowDocument } from '../../../domain/app/slideshow';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IQuery, query } from '../../../framework';
import { Slideshows } from '../../../domain';
import { Slideshow } from '../slideshows.types';
import { SlideshowByIdActivity } from '../activities';

@injectable()
@query({
    name: 'slideshows',
    activity: SlideshowByIdActivity,
    output: { type: Slideshow, isArray: true }
})
export class SlideshowsQuery implements IQuery<ISlideshowDocument[]> {

    constructor(@inject('Slideshows') private _slideshows: Slideshows) { }

    run(data: { _id: string }): Promise<ISlideshowDocument[]> {
        return this._slideshows.model.slideshows();
    }
}
