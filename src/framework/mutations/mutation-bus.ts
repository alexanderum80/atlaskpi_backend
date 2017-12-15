import * as Promise from 'bluebird';
import { injectable } from 'inversify';
import { inject } from 'inversify';
import { run } from 'tslint/lib/runner';
import { flatMap } from 'tslint/lib/utils';
import * as logger from 'winston';

import { AccessLogs } from '../../domain/app/access-log/access-log.model';
import { IExtendedRequest } from '../../middlewares/extended-request';
import { mutation } from '../decorators/mutation.decorator';
import { IActivity } from '../modules/security/activity';
import { IEnforcer } from '../modules/security/enforcer';
import { IMutation } from './mutation';
import { IValidationResult } from './validation-result';



export interface IMutationBus {
    run < T > (activity: IActivity, req: IExtendedRequest, mutation: IMutation < T > , data: any): Promise < any > ;
}

@injectable()
export class MutationBus implements IMutationBus {

    authorizedValue: any;
    errorBool: any;
    errorStr: any;
    logParams: any;

    public get enforcer(): IEnforcer {
        return this._enforcer;
    }

    constructor(@inject('Enforcer') private _enforcer: IEnforcer) {}

    run < T > (activity: IActivity, request: IExtendedRequest, mutation: IMutation < T > , data: any): Promise < any > {
        const that = this;
        // chack activity authorization
        return this.enforcer.authorizationTo(
                activity,
                request.user.roles.map(r => r.name),
                flatMap(request.user.roles, (r) => r.permissions))
            .then((authorized) => {
                that.authorizedValue = authorized;
                if (!authorized) {
                    return Promise.reject(authorized);
                }

                // run the mutation validation
                return mutation.validate ? mutation.validate(data) : {
                    success: true
                };
            })
            .then((result: IValidationResult) => {
                // if it is valid
                if (!result.success) {
                    return Promise.reject(result);
                }

                return Promise.resolve(true);
            })
            .then((validated: boolean) => {
                return new Promise < any > ((resolve, reject) => {
                    mutation.run(data).then(res => {
                            resolve(res);
                        })
                        .catch(e => {
                            logger.error(mutation.constructor.name, e);
                            resolve({
                                erros: [e.message]
                            });
                        });
                });
            })
            .then((res: T) => {
                return res;
            })
            .catch((err) => {
                that.errorStr = err;
                return Promise.reject(err);
            }).finally(() => {
                if (mutation.log === true) {
                    const user = request.user;
                    const accessBy = user ? user.profile.firstName + ' ' + user.profile.lastName : '';

                    that.logParams = {
                        timestamp: Date.now(),
                        accessBy: accessBy,
                        ipAddress: request.connection.remoteAddress,
                        event: mutation.constructor.name,
                        clientDetails: request.get('User-Agent'),
                        eventType: 'mutation',
                        payload: JSON.stringify(request.body),
                        results: {
                            authorized: that.authorizedValue,
                            status: true,
                            details: that.errorStr || ('Success executing ' + mutation.constructor.name)
                        }
                    };

                    const accessLogs = request.container.get < AccessLogs > (AccessLogs.name);

                    accessLogs.model.create(that.logParams);
                }

            });
    }
}