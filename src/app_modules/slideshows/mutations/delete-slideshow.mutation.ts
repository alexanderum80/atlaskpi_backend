import { ISlideshowModel } from '../../../models/app/slideshow/ISlideshow';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class DeleteSlideshowMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _SlideshowModel: ISlideshowModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._SlideshowModel.deleteSlideshow(data._id).then(slideshow => {
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
