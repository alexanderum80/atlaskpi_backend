import { injectable, inject } from 'inversify';
import { ModelBase } from '../../../type-mongo/model-base';
import { Schema } from 'mongoose';
import { ITemplateModel } from './template';
import { MasterConnection } from '../master.connection';

const templateSchema = new Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
});

@injectable()
export class Templates extends ModelBase<ITemplateModel> {
    static Schema = templateSchema;

    constructor(@inject(MasterConnection.name) appConnection: MasterConnection) {
        super();
        this.initializeModel(appConnection.get, 'Template', templateSchema, 'templates');
    }
}