import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ISlideshowDocument } from '../../../domain/app/slideshow/slideshow';
import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { Slideshow } from '../slideshows.types';
import { SlideshowByNameActivity } from '../activities/slideshow-by-name.activity';

@injectable()
@query({
    name: 'slideshowByName',
    activity: SlideshowByNameActivity,
    parameters: [
        { name: 'name', type: String, required: true },
    ],
    output: { type: Slideshow }
})
export class SlideshowByNameQuery implements IQuery<ISlideshowDocument> {
    constructor(@inject(Slideshows.name) private _slideshows: Slideshows) { }

    run(data: { name: string }): Promise<ISlideshowDocument> {
        return this._slideshows.model.slideshowByName(data.name);
    }
}
