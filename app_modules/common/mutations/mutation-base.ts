import { IIdentity, IMutation } from '../models';
import * as Promise from 'bluebird';

export abstract class MutationBase<T> implements IMutation<T> {
    log: boolean;
    audit: boolean;

    constructor(public identity: IIdentity) {
        this.log = true;
        this.audit = true;
    }

    abstract run(data: any): Promise<T>;
}