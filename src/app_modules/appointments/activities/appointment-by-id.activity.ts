import { ExtendedRequest } from '../../../middlewares/extended-request';
import { IActivity } from '../../../lib/enforcer';

export const AppointmentByIdActivity: IActivity = {
    may: 'appointment-by-id',
    when(identity: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};