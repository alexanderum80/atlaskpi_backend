import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { AuthController } from '../controllers';
import { ExtendedRequest } from '../middlewares';

const me = express.Router();

me.get('/me', function user(req: ExtendedRequest, res: Response) {
    if (!req.identity) {
        return res.status(401).json({ error: 'Invalid token' }).end();
    }
    res.status(200).json({ firstName: 'Forest', lastName: 'Gump', sex: 'M', dob: new Date(1959, 1, 1)}).end();
});

export { me };