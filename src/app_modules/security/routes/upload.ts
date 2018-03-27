import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { IExtendedRequest } from '../../../middlewares/extended-request';

const upload = express.Router();

upload.post('/', (req: IExtendedRequest, res: Response) => {
    if (!req.identity) {
        return res.status(401).json({ error: 'Invalid token' }).end();
    }

    console.log((req as any).files.fileItem); // the uploaded file object

});

export { upload };