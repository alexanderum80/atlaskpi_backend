import { inject, injectable } from 'inversify';
import { BaseAttachmentsService, IAttachementsService } from './base-attachments.service';
import { IAppConfig } from '../../configuration/config-models';
import { Attachments } from '../../domain/app/attachments/attachment-model';
import { CurrentUser } from '../../domain/app/current-user';
import { CurrentAccount } from '../../domain/master/current-account';
import { IAttachmentDocument, AttachmentCategoryEnum, AttachmentTypeEnum, IFileAttachment } from '../../domain/app/attachments/attachment';

export class UserAttachmentsService extends BaseAttachmentsService implements IAttachementsService {

    constructor(
        @inject('Config') config: IAppConfig,
        @inject(Attachments.name) attachments: Attachments,
        @inject(CurrentAccount.name) currentAccount: CurrentAccount,
        @inject(CurrentUser.name) private _user: CurrentUser
    ) {
        super(config, currentAccount, attachments);
    }

    async put(file: IFileAttachment): Promise<IAttachmentDocument> {
        const userId = this._user.get().id;

        return await this.saveAttachment(
            AttachmentCategoryEnum.User,
            AttachmentTypeEnum.ProfilePicture, userId, file);
    }

    get(bucket: string, key: string): Promise<Buffer> {
        return null;
    }

}