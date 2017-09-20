import { CreateAccessLogMutation } from '../mutations/app/access-log';
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
    run<T>(activityName: string, query: IQuery<T>, data: any, request?: any): Promise<any>;
}

export class QueryBus implements IQueryBus {

    authorizedValue: any;
    errorBool: any;
    errorStr: any;
    logParams: any;

    public get enforcer():  IEnforcer {
        return this._enforcer;
    }

    constructor(private _enforcer: IEnforcer) { }

    run<T>(activityName: string, query: IQuery<T>, data: any, request: any): Promise<any> {
        const that = this;
        // chack activity authorization
        return this.enforcer.authorizationTo(activityName, query.identity)
            .then((authorized) => {
                that.authorizedValue = authorized;
                if (!authorized) {
                    return Promise.reject(authorized);
                }

                return Promise.resolve(true);
            })
            .then((authorized: boolean) => {
                if (authorized) {
                    console.log('trying to run query: ' + query.constructor.name);
                    return query.run(data);
                }
            })
            .catch((err) => {
                that.errorStr = err;
                return Promise.resolve(err);
            }).finally(() => {
                // sometimes when using Apollo Chrome Extension the request object is undefined
                if ((query.log === true) && activityName !== 'get-all-access-logs' && request) {
                    that.logParams = {
                        timestamp: Date.now(),
                        accessBy: query.identity.username,
                        ipAddress: request.connection ? request.connection.remoteAddress : '',
                        event: query.constructor.name,
                        clientDetails: request.get('User-Agent'),
                        eventType: 'query',
                        payload: JSON.stringify(request.body),
                        results: {
                            authorized: that.authorizedValue,
                            status: true,
                            details: that.errorStr || ('Success executing ' + query.constructor.name)
                        }
                    };
                    let accessLog = new CreateAccessLogMutation(query.identity, request.appContext.AccessModel);
                    accessLog.run(that.logParams);
                }
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
