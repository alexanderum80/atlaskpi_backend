import { inject, injectable } from 'inversify';
import { IAppConfig } from '../../configuration/config-models';
import { S3 } from 'aws-sdk';
import { Attachments } from '../../domain/app/attachments/attachment-model';
import { CurrentAccount } from '../../domain/master/current-account';
import { IFileAttachment, IAttachmentDocument, AttachmentTypeEnum, AttachmentCategoryEnum } from '../../domain/app/attachments/attachment';

export interface IAttachementsService {
    put(file: IFileAttachment): Promise<IAttachmentDocument>;
    get(bucket: string, key: string): Promise<Buffer>;
}

export interface IS3ObjectLocation {
    bucket: string;
    key: string;
}

@injectable()
export abstract class BaseAttachmentsService {
    private _s3: S3;
    private _bucket = 'content.atlaskpi.com';

    constructor(
        @inject('Config') protected config: IAppConfig,
        @inject(CurrentAccount.name) protected currentAccount: CurrentAccount,
        @inject(Attachments.name) protected attachments: Attachments) {
        this._s3 = new S3({
            accessKeyId: config.aws.accessKeyId,
            secretAccessKey: config.aws.secretAccessKey
         });
    }

    protected async saveAttachment(category: AttachmentCategoryEnum, type: AttachmentTypeEnum, id: string, file: IFileAttachment): Promise<IAttachmentDocument> {
        const that = this;

        try {
            const uploadResp = await that.upload(file);
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
                }
            }, { upsert: true });

            return res;

        } catch (e) {
            return e;
        }
    }

    // protected saveAttachment1(category: AttachmentCategoryEnum, type: AttachmentTypeEnum, id: string, file: IFileAttachment): Promise<IAttachmentDocument> {
    //     const that = this;

    //     return new Promise<IAttachmentDocument>((resolve, reject) => {
    //         that.upload(file).then(res => {
    //             that.attachments.model.findOneAndUpdate({
    //                 'attachedTo.identifier': id,
    //                 type: AttachmentTypeEnum.ProfilePicture
    //             }, {
    //                 bucket: res.bucket,
    //                 key: res.key,
    //                 attachedTo: {
    //                     category: AttachmentCategoryEnum.User,
    //                     type: AttachmentTypeEnum.ProfilePicture,
    //                     identifier: id
    //                 }
    //             }, { upsert: true }, (err, doc) => {
    //                 if (err) {
    //                     reject(err);
    //                 }

    //                 resolve(doc);
    //             });
    //         });
    //     });
    // }

    protected upload(file: IFileAttachment): Promise<IS3ObjectLocation> {
        const that = this;
        const tenant = this.currentAccount.get.name;
        const key = `${tenant}/${file.md5}_${file.name}`;

        return new Promise<IS3ObjectLocation>((resolve, reject) => {
            that._s3.putObject({
                Bucket: that._bucket,
                Key: key,
                Body: file.data
            }, (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve({
                    bucket: that._bucket,
                    key: key
                });
            });
        });
    }

    protected download(bucket: string, key: string): Promise<Buffer> {
        const that = this;
        
        return new Promise<boolean>((resolve, reject) => {
            that._s3.getObject({
                Bucket: that._bucket,
                Key: `${tenant}/${md5}_${name}`
            }, (err, data) => {

            });
        });
    }

}