import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ISlideshowDocument } from '../../../domain/app/slideshow/slideshow';
import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { SlideshowByIdActivity } from '../activities/slideshow-by-id.activity';
import { Slideshow } from '../slideshows.types';

@injectable()
@query({
    name: 'slideshowById',
    activity: SlideshowByIdActivity,
    parameters: [
        { name: '_id', type: String, required: true },
    ],
    output: { type: Slideshow }
})
export class SlideshowByIdQuery implements IQuery<ISlideshowDocument> {
    constructor(@inject(Slideshows.name) private _slideshows: Slideshows) { }

    run(data: { _id: string }): Promise<ISlideshowDocument> {
        return this._slideshows.model.slideshowById(data._id);
    }
}
