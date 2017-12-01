import { ExtendedRequest } from '../../../middlewares';
import { IActivity } from '../../../lib/enforcer';

export const listAppointmentsActivity: IActivity = {
    may: 'list-appointments',
    when(identity: ExtendedRequest, cb: (err: any, authorized: boolean) => void) {
        cb(null, true);
    }
};