import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { ISlideshowInput } from '../../../domain/app/slideshow/slideshow';
import { Slideshows } from '../../../domain/app/slideshow/slideshow.model';
import { field } from '../../../framework/decorators/field.decorator';
import { input } from '../../../framework/decorators/input.decorator';
import { mutation } from '../../../framework/decorators/mutation.decorator';
import { MutationBase } from '../../../framework/mutations/mutation-base';
import { IMutationResponse } from '../../../framework/mutations/mutation-response';
import { CreateSlideshowActivity } from '../activities/create-slideshow.activity';
import { SlideshowInput, SlideshowResponse } from '../slideshows.types';

@injectable()
@mutation({
    name: 'createSlideshow',
    activity: CreateSlideshowActivity,
    parameters: [
        { name: 'input', type: SlideshowInput, required: true },
    ],
    output: { type: SlideshowResponse }
})
export class CreateSlideshowMutation extends MutationBase<IMutationResponse> {
    constructor(@inject(Slideshows.name) private _slideshows: Slideshows) {
        super();
    }

    run(data: { input: ISlideshowInput }): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
            that._slideshows.model.createSlideshow(data.input).then(slideshow => {
                resolve({
                    success: true,
                    entity: slideshow
                });
            }).catch(err => {
                resolve({
                    success: false,
                    errors: [
                        {
                            field: 'general',
                            errors: ['There was an error creating slideshow']
                        }
                    ]
                });
            });
        });
    }
}
