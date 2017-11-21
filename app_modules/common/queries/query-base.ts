import { IIdentity } from '../models';
import { IQuery } from './query';
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