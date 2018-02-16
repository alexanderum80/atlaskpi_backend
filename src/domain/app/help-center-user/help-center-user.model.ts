import { Address } from '../../common/address.model';
import * as Promise from 'bluebird';
import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';
import * as logger from 'winston';

import { ModelBase } from '../../../type-mongo/model-base';
import { AppConnection } from '../app.connection';
import { IHelpCenterUserModel, IHelpCenterUserDocument } from './help-center-user';


let Schema = mongoose.Schema;

const UsersSchema = new  Schema({
        username: String,
        tokens: String
    });

UsersSchema.statics.helpCenterUserById = function(id: string): Promise<IHelpCenterUserDocument> {
    const that = <IHelpCenterUserModel> this;

    return new Promise<IHelpCenterUserDocument>((resolve, reject) => {
        that.findOne({_id: id}).then(helpCenterUser => {
            resolve(helpCenterUser);
        }).catch(err => {
            logger.error(err);
            reject('There was an error retrieving user');
        });
    });
};

@injectable()
export class HelpCenterUsers extends ModelBase < IHelpCenterUserModel > {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'HelpCenterUsers', UsersSchema , 'helpCenterUser');
    }
}


