import { inject, injectable } from 'inversify';
import { BaseAttachmentsService, IAttachementsService } from './base-attachments.service';
import { IAppConfig } from '../../configuration/config-models';
import { Attachments } from '../../domain/app/attachments/attachment-model';
import { CurrentUser } from '../../domain/app/current-user';
import { CurrentAccount } from '../../domain/master/current-account';
import { IAttachmentDocument, AttachmentCategoryEnum, AttachmentTypeEnum, IFileAttachment } from '../../domain/app/attachments/attachment';
import * as sharp from 'sharp';
import { Logger } from '../../domain/app/logger';

export class UserAttachmentsService extends BaseAttachmentsService implements IAttachementsService {

    constructor(
        @inject('Config') config: IAppConfig,
        @inject(Logger.name) logger: Logger,
        @inject(Attachments.name) attachments: Attachments,
        @inject(CurrentAccount.name) currentAccount: CurrentAccount,
        @inject(CurrentUser.name) private _user: CurrentUser
    ) {
        super(logger, config, currentAccount, attachments);
    }

    async put(file: IFileAttachment, publicFile: boolean, metadata: any): Promise<IAttachmentDocument> {
        const userId = this._user.get().id;

        try {
            // I need to resize this picture before upload it in order to save space
            // and data transfer
            file.data = await sharp(file.data)
                .resize(120, 120)
                .toBuffer();

            return await this.saveAttachment(
                AttachmentCategoryEnum.User,
                AttachmentTypeEnum.ProfilePicture,
                userId,
                file,
                publicFile,
                metadata);
        } catch (e) {
            console.error('There was an error uploading the image', e);
            return null;
        }
    }
}