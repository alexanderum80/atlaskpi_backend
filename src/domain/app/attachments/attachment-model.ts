import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';
import { IAttachmentModel, AttachmentCategoryEnum, AttachmentTypeEnum, IAttachmentDocument } from './attachment';
import { S3Service } from '../../../services/aws/s3.service';
import { CurrentAccount } from '../../master/current-account';

const AttachmentSchema = new mongoose.Schema({
    bucket: { type: String, required: true},
    key: { type: String, required: true },
    attachedTo: {
        category: { type: String, required: true },
        type: { type: String, required: true },
        identifier: { type: String, required: true }
    },
    description: String,
    createdOn: { type: Date, default: Date.now }
});

// add tags capabilities
AttachmentSchema.plugin(tagsPlugin);

AttachmentSchema.statics.addAttachment = addAttachment;
AttachmentSchema.statics.removeAttachment = removeAttachment;
AttachmentSchema.statics.getAttachment = getAttachment;


function addAttachment(
    category: AttachmentCategoryEnum,
    type: AttachmentTypeEnum,
    identifier: string,
    name: string,
    md5: string,
    data: Buffer,
    description?: string): Promise<IAttachmentDocument> {
    const Model = this as IAttachmentModel;

    return new Promise<IAttachmentDocument>((resolve, reject) => {
        Model.s3Service.uploadProfilePicture(Model.currentAccount.get.name, name, md5, data)
            .then(s => {
                Model.create({
                    bucket: s.bucket,
                    key: s.key,
                    attachedTo: {
                        category: category,
                        type: type,
                        identifier: identifier
                    },
                    description: description
                }, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(data);
                });
                console.log('uploaded succesfully');
            })
            .catch(e => {
                console.error('error uploading file');
            });

    });


}

function removeAttachment(id: string) {
    
}

function getAttachment(id: string) {

}

@injectable()
export class Attachments extends ModelBase<IAttachmentModel> {
    constructor(
        @inject(AppConnection.name) appConnection: AppConnection,
        @inject(CurrentAccount.name) private currentAccount: CurrentAccount,
        @inject(S3Service.name) public s3Service) {
        super();

        this.initializeModel(appConnection.get, 'Attachment', AttachmentSchema, 'attachments');
        this.model.s3Service = s3Service;
        this.model.currentAccount = currentAccount;
    }
}