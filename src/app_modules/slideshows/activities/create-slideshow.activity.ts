import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const CreateSlideshowActivity: IActivity = {
    may: 'create-slideshow',
    when(request: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};