import * as url from 'url';
import * as express from 'express';
import { Request, Response } from 'express';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { Attachments } from '../../domain/app/attachments/attachment-model';
import { AttachmentCategoryEnum, AttachmentTypeEnum } from '../../domain/app/attachments/attachment';

const attachments = express.Router();

attachments.post('/', (req: IExtendedRequest, res: Response) => {
    if (!req.identity) {
        return res.status(401).json({ error: 'Invalid token' }).end();
    }

    const type = req.body.type;
    const fileItem = (req as any).files.fileItem;
    const attachmentModel = req.Container.instance.get<Attachments>(Attachments.name);

    attachmentModel.model.addAttachment(
        AttachmentCategoryEnum.User,
        AttachmentTypeEnum.ProfilePicture,
        '123456',
        fileItem.name,
        fileItem.md5,
        fileItem.data).then(attachment => {
        res.status(200).json({
            key: attachment.key
        });
    }).catch(err => {
        res.status(500).json({ error: 'There was an error uploading image' });
    });
});

export { attachments };