import { IMutation } from './mutation';
import * as Promise from 'bluebird';

export abstract class MutationBase<T> implements IMutation<T> {
    log: boolean;
    audit: boolean;

    constructor() {
        this.log = true;
        this.audit = true;
    }

    abstract run(data: any): Promise<T>;
}