import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import { isArray } from 'util';

import { ISlideshowDocument } from '../../../domain/app/slideshow/slideshow';
import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { query } from '../../../framework/decorators/query.decorator';
import { IQuery } from '../../../framework/queries/query';
import { SlideshowByGroupActivity } from '../activities/slideshows-by-group.activity';
import { Slideshow } from '../slideshows.types';

@injectable()
@query({
    name: 'slideShowsByGroupChart',
    activity: SlideshowByGroupActivity,
    parameters: [
        { name: 'group', type: String, required: true }
    ],
    output: { type: Slideshow, isArray: true }
})
export class SlideShowsByGroupChartQuery implements IQuery<ISlideshowDocument[]> {
    constructor(@inject(Slideshows.name) private _slideshows: Slideshows) { }

    run(data: { group: string }): Promise<ISlideshowDocument[]> {
        return this._slideshows.model.slideshowsByGroupChart(data.group);
    }
}
