import mongoose = require('mongoose');
import * as Promise from 'bluebird';
import { IUser, IUserDocument, IUserModel } from '.';
import * as bcrypt from 'bcrypt';
import { rbacPlugin } from '../../../../lib/rbac';
import { accountPlugin } from './user-plugin';


let Schema = mongoose.Schema;

let UserSchema = new Schema({});

UserSchema.plugin(accountPlugin);
UserSchema.plugin(rbacPlugin);

export function getUserModel(m: mongoose.Connection): IUserModel {
    return <IUserModel>m.model('User', UserSchema, 'users');
}

