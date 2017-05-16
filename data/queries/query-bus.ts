// import { IValidationResult } from './validation-result';
import {
    IIdentity,
    IMasterModels,
    IAppModels,
    IQuery
} from '..';
import { Enforcer, getEnforcerConfig, IEnforcer } from '../../lib/enforcer';
import * as Promise from 'bluebird';


export interface IQueryBus {
    run<T>(activityName: string, query: IQuery<T>, data: any): Promise<any>;
}

export class QueryBus implements IQueryBus {

    public get enforcer():  IEnforcer {
        return this._enforcer;
    }

    constructor(private _enforcer: IEnforcer) { }

    run<T>(activityName: string, query: IQuery<T>, data: any): Promise<any> {
        // chack activity authorization
        return this.enforcer.authorizationTo(activityName, query.identity)
            .then((authorized) => {
                if (!authorized) {
                    return Promise.reject(authorized);
                }

                return Promise.resolve(true);
            })
            .then((authorized: boolean) => {
                if (authorized) {
                    console.log('trying to run query');
                    return query.run(data);
                }
            })
            .catch((err) => {
                return Promise.reject(err);
            });

    }
}

let _queryBus: IQueryBus = null;

export function getQueryBusSingleton() {
    if (!_queryBus) {
        let enforcer = new Enforcer(getEnforcerConfig());
        _queryBus = new QueryBus(enforcer);
    }

    return _queryBus;
}
