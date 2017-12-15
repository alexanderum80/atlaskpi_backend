import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { field } from '../../../framework/decorators/field.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { DeleteSlideshowActivity } from '../activities/delete-slideshow.activity';
import { SlideshowResponse } from '../slideshows.types';

@injectable()
@mutation({
    name: 'deleteSlideshow',
    activity: DeleteSlideshowActivity,
    parameters: [
        { name: '_id', type: String },
    ],
    output: { type: SlideshowResponse }
})
export class DeleteSlideshowMutation extends MutationBase<IMutationResponse> {
    constructor(@inject('Slideshows') private _slideshows: Slideshows) {
        super();
    }

    run(data: { _id: string }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._slideshows.model.deleteSlideshow(data._id).then(slideshow => {
                resolve({
                    success: true
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error Deleting Slideshow']
                        }
                    ]
                });
            });
        });
    }
}
