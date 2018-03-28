import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { S3 } from 'aws-sdk';
import { S3Service } from '../../../services/aws/s3.service';
import { CurrentAccount } from '../../master/current-account';

export enum AttachmentCategoryEnum {
    User = 'user'
}

export enum AttachmentTypeEnum {
    ProfilePicture = 'profile-picture'
}

export interface IAttachment {
    bucket: string,
    key: string;
    attachedTo: {
        category: AttachmentCategoryEnum,
        type: AttachmentTypeEnum,
        identifier: string
    };
    description? : string;
    createdOn: Date;
}

export interface IAttachmentDocument extends IAttachment, mongoose.Document {
    
}

export interface IAttachmentModel extends mongoose.Model<IAttachmentDocument> {
    s3Service: S3Service;
    currentAccount: CurrentAccount;

    addAttachment(
        category: AttachmentCategoryEnum,
        type: AttachmentTypeEnum,
        identifier: string,
        name: string,
        md5: string,
        data: Buffer,
        description?: string): Promise<IAttachmentDocument>;
    removeAttachment(id: string): Promise<boolean>;
    getAttachment(id: string): Promise<boolean>;
}
