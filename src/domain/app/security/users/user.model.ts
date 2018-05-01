import { inject, injectable } from 'inversify';
import * as mongoose from 'mongoose';

import { ModelBase } from '../../../../type-mongo/model-base';
import { AppConnection } from '../../app.connection';
import { rbacPlugin } from './rbac-plugin';
import { IUserModel } from './user';
import { userPlugin } from './user-plugin';
import { searchPlugin } from '../../global-search/global-search.plugin';


const Schema = mongoose.Schema;
const UserSchema = new Schema({});

UserSchema.plugin(userPlugin);
UserSchema.plugin(rbacPlugin);
UserSchema.plugin(searchPlugin);

@injectable()
export class Users extends ModelBase<IUserModel> {
    constructor(@inject(AppConnection.name) appConnection: AppConnection) {
        super();
        this.initializeModel(appConnection.get, 'User', UserSchema, 'users');
    }
}


