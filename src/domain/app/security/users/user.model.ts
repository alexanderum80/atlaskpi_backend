import { IUserModel } from './user';
import { ModelBase } from '../../../../type-mongo';
import { AppConnection } from '../../app.connection';
import { injectable, inject } from 'inversify';
import * as mongoose from 'mongoose';
import { userPlugin } from './user-plugin';
import { rbacPlugin } from './rbac-plugin';

const Schema = mongoose.Schema;
const UserSchema = new Schema({});

UserSchema.plugin(userPlugin);
UserSchema.plugin(rbacPlugin);

@injectable()
export class Users extends ModelBase<IUserModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super(appConnection, 'User', UserSchema, 'users');
    }
}


