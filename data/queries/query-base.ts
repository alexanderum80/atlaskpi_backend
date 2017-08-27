import { IAppModels } from '../models/app/app-models';
import { IIdentity } from '../models/app/identity';
import { IQuery } from './';
import * as Promise from 'bluebird';

export abstract class QueryBase<T> implements IQuery<T> {

    log: boolean;
    audit: boolean;

    constructor(public identity: IIdentity) {
        this.log = true;
        this.audit = true;
    }

     abstract run(data: any): Promise<T>;
}