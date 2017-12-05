import { ISlideshowInput } from '../../../domain/app/slideshow';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

import { Slideshows } from '../../../domain';
import { IMutationResponse, mutation, MutationBase } from '../../../framework';
import { CreateSlideshowActivity } from '../activities';
import { SlideshowResponse, SlideshowInput } from '../slideshows.types';

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
    constructor(@inject('Slideshows') private _slideshows: Slideshows) {
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
