import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { IExtendedRequest } from '../../../middlewares/extended-request';

const me = express.Router();

me.get('/me', function user(req: IExtendedRequest, res: Response) {
    if (!req.identity) {
        return res.status(401).json({ error: 'Invalid token' }).end();
    }
    return res.status(200).json({ firstName: 'Forest', lastName: 'Gump', sex: 'M', dob: new Date(1959, 1, 1)}).end();
});

export { me };