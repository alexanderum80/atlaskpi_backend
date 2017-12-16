import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { ISlideshowDocument } from '../../../domain/app/slideshow/slideshow';
import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { SlideshowByIdActivity } from '../activities/slideshow-by-id.activity';
import { Slideshow } from '../slideshows.types';

@injectable()
@query({
    name: 'slideshows',
    activity: SlideshowByIdActivity,
    output: { type: Slideshow, isArray: true }
})
export class SlideshowsQuery implements IQuery<ISlideshowDocument[]> {

    constructor(@inject(Slideshows.name) private _slideshows: Slideshows) { }

    run(data: { _id: string }): Promise<ISlideshowDocument[]> {
        return this._slideshows.model.slideshows();
    }
}
