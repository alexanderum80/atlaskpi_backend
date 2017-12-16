import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ISlideshowInput } from '../../../domain/app/slideshow/slideshow';
import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { UpdateSlideshowActivity } from '../activities/update-slideshow.activity';
import { SlideshowInput, SlideshowResponse } from '../slideshows.types';

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
    constructor(@inject(Slideshows.name) private _slideshows: Slideshows) {
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
