import { IActivity } from '../authorization';
import {
    IQuery
} from '..';
import { IEnforcer } from '../modules/security/enforcer';
import * as Promise from 'bluebird';
import * as logger from 'winston';
import { injectable } from 'inversify';
import { IExtendedRequest } from '../models';
import { inject } from 'inversify';


export interface IQueryBus {
    run<T>(activity: IActivity, req: IExtendedRequest, query: IQuery<T>, data: any): Promise<any>;
}

@injectable()
export class QueryBus implements IQueryBus {

    authorizedValue: any;
    errorBool: any;
    errorStr: any;
    logParams: any;

    public get enforcer():  IEnforcer {
        return this._enforcer;
    }

    constructor(@inject('Enforcer') private _enforcer: IEnforcer) { }

    run<T>(activity: IActivity, request: IExtendedRequest, query: IQuery<T>, data: any): Promise<any> {
        const that = this;
        // chack activity authorization
        return this.enforcer.authorizationTo(activity, request)
            .then((authorized) => {
                if (!authorized) {
                    return Promise.reject(authorized);
                }

                return Promise.resolve(true);
            })
            .then((authorized: boolean) => {
                that.authorizedValue = authorized;
                if (authorized) {
                    console.log('trying to run query: ' + query.constructor.name);
                    return query.run(data)
                        .then(data => data)
                        .catch(err => {
                            logger.error(query.constructor.name, err);
                        });
                }
            })
            .catch((err) => {
                that.errorStr = err;
                return Promise.resolve(err);
            }).finally(() => {
                // sometimes when using Apollo Chrome Extension the request object is undefined
                if ((query.log === true) && request && request) {
                    const user = request.user;
                    const accessBy = user ? user.profile.firstName + ' ' + user.profile.lastName : '';

                    that.logParams = {
                        timestamp: Date.now(),
                        accessBy: accessBy,
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

                    request.appContext.AccessModel.create(that.logParams);
                }
            });

    }
}