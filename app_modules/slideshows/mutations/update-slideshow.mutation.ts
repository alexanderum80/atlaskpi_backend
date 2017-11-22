import { ISlideshowModel } from '../../../models/app/slideshow/ISlideshow';
import { MutationBase } from '../../mutation-base';
import { IIdentity, IMutationResponse } from '../../..';
import { IMutation, IValidationResult } from '../..';
import * as Promise from 'bluebird';
import * as logger from 'winston';

export class UpdateSlideshowMutation extends MutationBase<IMutationResponse> {
    constructor(
        public identity: IIdentity,
        private _SlideshowModel: ISlideshowModel) {
            super(identity);
        }

    run(data): Promise<IMutationResponse> {
        const that = this;

        return new Promise<IMutationResponse>((resolve, reject) => {
           that._SlideshowModel.updateSlideshow(data._id, data.input).then(slideshow => {
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
