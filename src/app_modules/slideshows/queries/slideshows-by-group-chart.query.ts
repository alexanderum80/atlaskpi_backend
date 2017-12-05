import { ISlideshowDocument } from '../../../domain/app/slideshow';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { QueryBase, query } from '../../../framework';
import { Slideshows } from '../../../domain';
import { Slideshow } from '../slideshows.types';
import { SlideshowByGroupActivity } from '../activities';

@injectable()
@query({
    name: 'slideShowsByGroupChart',
    activity: SlideshowByGroupActivity,
    parameters: [
        { name: 'group', type: String, required: true }
    ],
    output: { type: Slideshow, isArray: true }
})
export class SlideShowsByGroupChartQuery extends QueryBase<ISlideshowDocument[]> {
    constructor(@inject('Slideshows') private _slideshows: Slideshows) {
        super();
    }

    run(data: { group: string }): Promise<ISlideshowDocument[]> {
        return this._slideshows.model.slideshowsByGroupChart(data.group);
    }
}
