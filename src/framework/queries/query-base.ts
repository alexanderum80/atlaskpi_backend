import * as Promise from 'bluebird';
import { injectable } from 'inversify';

import { IQuery } from './query';

@injectable()
export abstract class QueryBase<T> implements IQuery<T> {

    log: boolean;
    audit: boolean;

    constructor() {
        this.log = true;
        this.audit = true;
    }

     abstract run(data: any): Promise<T>;
}