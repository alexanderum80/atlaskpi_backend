import { ModelBase } from '../../../type-mongo';
import { AppConnection } from '../app.connection';
import { injectable, inject } from 'inversify';
import { rbacPlugin } from '../../../framework/modules/security/rbac';
import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IUser, IUserDocument, IUserModel } from '.';
import { accountPlugin } from './user-plugin';


let Schema = mongoose.Schema;

let UserSchema = new Schema({});

UserSchema.plugin(accountPlugin);
UserSchema.plugin(rbacPlugin);

@injectable()
export class Users extends ModelBase<IUserModel> {
    constructor(@inject('AppConnection') appConnection: AppConnection) {
        super(appConnection, 'User', UserSchema, 'users');
    }
}


