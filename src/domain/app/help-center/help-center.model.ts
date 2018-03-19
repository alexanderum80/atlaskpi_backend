import { MasterConnection } from '../../master/master.connection';
import { ModelBase } from '../../../type-mongo/model-base';
import { IHelpCenterDocument, IHelpCenterModel } from './help-center';
import * as mongoose from 'mongoose';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';

const Schema = mongoose.Schema;

const HelpCenterSchema = new Schema({
    name: String,
    // in seconds
    duration: {
        type: Number,
        get: d => Math.round(d),
        set: d => Math.round(d)
    },
    url: String
});


HelpCenterSchema.statics.helpVideos = function(): Promise<IHelpCenterDocument[]> {
    const helpCenterModel = (<IHelpCenterModel>this);

    return new Promise<IHelpCenterDocument[]>((resolve, reject) => {
        return helpCenterModel.find({})
            .then((videos: IHelpCenterDocument[]) => {
                resolve(videos);
                return;
            }).catch(err => {
                reject(err);
                return;
            });
    });
};


@injectable()
export class HelpCenter extends ModelBase<IHelpCenterModel> {
    constructor(@inject(MasterConnection.name) masterConnection: MasterConnection) {
        super();
        this.initializeModel(masterConnection.get, 'HelpCenter', HelpCenterSchema, 'helpCenter');
    }
}
