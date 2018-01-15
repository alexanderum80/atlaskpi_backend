import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { inject } from 'inversify';
import { flatMap } from 'lodash';
import { run } from 'tslint/lib/runner';
import * as logger from 'winston';

import { Enforcer } from '../../app_modules/security/enforcer/enforcer';
import { AccessLogs } from '../../domain/app/access-log/access-log.model';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { query } from '../decorators/query.decorator';
import { IActivity } from '../modules/security/activity';
import { IEnforcer } from '../modules/security/enforcer';
import { IQuery } from './query';




export interface IQueryBus {
    run<T>(activity: new () => IActivity, req: IExtendedRequest, query: IQuery<T>, data: any): Promise<any>;
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

    constructor(@inject(Enforcer.name) private _enforcer: IEnforcer) { }

    run<T>(activity: new () => IActivity, request: IExtendedRequest, query: IQuery<T>, data: any): Promise<any> {
        const that = this;

        // we are not going to have a user for every request so we need to take that into consideration
        let roles = [];
        let permissions = [];

        if (request.user) {
            roles = request.user.roles.map(r => r.name);
            permissions = flatMap(request.user.roles, (r) => r.permissions);
        }

        // get activity instance
        const act: IActivity = request.Container.instance.get(activity.name);

        // chack activity authorization
        return this.enforcer.authorizationTo(
            act,
            roles,
            permissions)
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
                    const accessLogs = request.Container.instance.get<AccessLogs>(AccessLogs.name);

                    accessLogs.model.create(that.logParams);
                }
            });

    }
}