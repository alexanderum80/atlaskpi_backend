import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { tagsPlugin } from '../tags/tag.plugin';
import { IAttachmentModel, AttachmentCategoryEnum, AttachmentTypeEnum, IAttachmentDocument } from './attachment';
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

@injectable()
export class Attachments extends ModelBase<IAttachmentModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'Attachment', AttachmentSchema, 'attachments');
    }
}