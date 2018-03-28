import { inject, injectable } from 'inversify';
import { BaseAttachmentsService } from './base-attachments.service';
import { IAppConfig } from '../../configuration/config-models';
import { Attachments } from '../../domain/app/attachments/attachment-model';
import { CurrentUser } from '../../domain/app/current-user';
import { CurrentAccount } from '../../domain/master/current-account';
import { IAttachmentDocument } from '../../domain/app/attachments/attachment';

export class UserAttachmentsService extends BaseAttachmentsService {

    constructor(
        @inject('Config') config: IAppConfig,
        @inject(Attachments.name) attachments: Attachments,
        @inject(CurrentAccount.name) currentAccount: CurrentAccount,
        @inject(CurrentUser.name) user: CurrentUser
    ) {
        super(config, currentAccount, attachments);
    }

    updateProfilePicture(name: string, md5: string, data: Buffer): Promise<IAttachmentDocument> {
        return this.put(name, md5, data).then(res => {
            return {} as IAttachmentDocument;
        });
    }

}