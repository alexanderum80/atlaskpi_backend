import { inject, injectable } from 'inversify';
import { IAppConfig } from '../../configuration/config-models';
import { S3 } from 'aws-sdk';
import { Attachments } from '../../domain/app/attachments/attachment-model';
import { CurrentAccount } from '../../domain/master/current-account';
import { IFileAttachment, IAttachmentDocument, AttachmentTypeEnum, AttachmentCategoryEnum } from '../../domain/app/attachments/attachment';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { Logger } from '../../domain/app/logger';

export interface IAttachementsService {
    put(file: IFileAttachment, publicFile: boolean, metadata?: any): Promise<IAttachmentDocument>;
    get(bucket: string, key: string): Promise<Buffer>;
    getUrl(category: AttachmentCategoryEnum, type: AttachmentTypeEnum, id: string): Promise<string>;
}

export interface IS3ObjectLocation {
    bucket: string;
    key: string;
}

@injectable()
export abstract class BaseAttachmentsService {
    private _s3: S3;
    private _bucket = 'content.atlaskpi.com';
    private _baseS3Url = 'https://s3.amazonaws.com/';

    constructor(
        @inject(Logger.name) private _logger: Logger,
        @inject('Config') protected config: IAppConfig,
        @inject(CurrentAccount.name) protected currentAccount: CurrentAccount,
        @inject(Attachments.name) protected attachments: Attachments) {
        this._s3 = new S3({
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey
         });
    }

    protected async saveAttachment(
        category: AttachmentCategoryEnum,
        type: AttachmentTypeEnum,
        id: string,
        file: IFileAttachment,
        publicFile: boolean,
        metadata: any): Promise<IAttachmentDocument> {
        const that = this;

        try {
            const uploadResp = await that.upload(file, publicFile);
            const res = await that.attachments.model.findOneAndUpdate({
                'attachedTo.identifier': id,
                'attachedTo.type': AttachmentTypeEnum.ProfilePicture
            }, {
                bucket: uploadResp.bucket,
                key: uploadResp.key,
                attachedTo: {
                    category: AttachmentCategoryEnum.User,
                    type: AttachmentTypeEnum.ProfilePicture,
                    identifier: id
                },
                metadata: metadata
            }, { upsert: true });

            return res;

        } catch (e) {
            return e;
        }
    }

    async get(bucket: string, key: string): Promise<Buffer> {
        const that = this;

        const object = await that._s3.getObject({
            Bucket: that._bucket,
            Key: key
        }).promise();

        return object.Body as Buffer;
    }

    async getUrl(category: AttachmentCategoryEnum, type: AttachmentTypeEnum, id: string):  Promise<string> {
        try {
            const attachment = await this.attachments.model.findOne({
                'attachedTo.category': AttachmentCategoryEnum.User,
                'attachedTo.type': AttachmentTypeEnum.ProfilePicture,
                'attachedTo.identifier': id
            });

            return attachment
                ? `${this._baseS3Url}${attachment.bucket}/${attachment.key}`
                : '';
        } catch (e) {
            this._logger.error('There was an error retrieving s3 object url', e);
            return '';
        }
    }

    protected async upload(file: IFileAttachment, publicFile: boolean = false): Promise<IS3ObjectLocation> {
        const that = this;
        const tenant = this.currentAccount.get.name;
        const key = `${tenant}/${file.md5}_${file.name}`;
        const object: PutObjectRequest = {
            Bucket: that._bucket,
            Key: key,
            Body: file.data
        };

        if (publicFile) {
            object.ACL = 'public-read';
        }

        const s3Resp = await that._s3.putObject(object).promise();

        return {
            bucket: that._bucket,
            key: key
        };
    }

}