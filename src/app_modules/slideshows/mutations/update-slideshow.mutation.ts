import { ISlideshowInput } from '../../../domain/app/slideshow';

import { injectable, inject } from 'inversify';
import * as Promise from 'bluebird';
import { IMutationResponse, MutationBase, mutation } from '../../../framework';
import { Slideshows } from '../../../domain';
import { SlideshowResponse, SlideshowInput } from '../slideshows.types';
import { UpdateSlideshowActivity } from '../activities';

@injectable()
@mutation({
    name: 'updateSlideshow',
    activity: UpdateSlideshowActivity,
    parameters: [
        { name: '_id', type: String, required: true },
        { name: 'input', type: SlideshowInput, required: true },
    ],
    output: { type: SlideshowResponse }
})
export class UpdateSlideshowMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Slideshows') private _slideshows: Slideshows) {
        super();
    }

    run(data: { _id: string, input: ISlideshowInput,  }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._slideshows.model.updateSlideshow(data._id, data.input).then(slideshow => {
                resolve({
                    success: true,
                    entity: slideshow
                });
                return;
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error updating slideshow']
                        }
                    ]
                });
                return;
            });
        });
    }
}
