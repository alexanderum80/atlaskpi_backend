import { IIdentity } from '../models/app/identity';
import { IMutation } from './';
import * as Promise from 'bluebird';

export abstract class MutationBus<T> implements IMutation<T> {
    log: boolean;
    audit: boolean;

    constructor(public identity: IIdentity) {
        this.log = true;
        this.audit = true;
    }

    abstract run(data: any): Promise<T> {};
}