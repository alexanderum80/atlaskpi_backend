import { IActivity } from '../authorization';
import {
    IMutation,
    IValidationResult
} from '..';
import { Enforcer, IEnforcer } from '../modules/security/enforcer';
import * as Promise from 'bluebird';
import * as logger from 'winston';
import { injectable } from 'inversify';
import { IExtendedRequest } from '../models';


export interface IMutationBus {
    run<T>(activity: IActivity, req: IExtendedRequest, mutation: IMutation<T>, data: any): Promise<any>;
}

@injectable()
export class MutationBus implements IMutationBus {

    authorizedValue: any;
    errorBool: any;
    errorStr: any;
    logParams: any;

    public get enforcer():  IEnforcer {
        return this._enforcer;
    }

    constructor(private _enforcer: IEnforcer) {}

    run<T>(activity: IActivity, req: IExtendedRequest, mutation: IMutation<T>, data: any): Promise<any> {
        const that = this;
        // chack activity authorization
        return this.enforcer.authorizationTo(activity, req)
            .then((authorized) => {
                that.authorizedValue = authorized;
                if (!authorized) {
                    return Promise.reject(authorized);
                }

                // run the mutation validation
                return mutation.validate ? mutation.validate(data) : { success: true };
            })
            .then((result: IValidationResult) => {
                // if it is valid
                if (!result.success) {
                    return Promise.reject(result);
                }

                return Promise.resolve(true);
            })
            .then((validated: boolean) => {
                return new Promise<any>((resolve, reject) => {
                    mutation.run(data).then(res => {
                        resolve(res);
                    })
                    .catch(e => {
                        logger.error(mutation.constructor.name, e);
                        resolve({ erros: [e.message] });
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
                    const user = req.user;
                    const accessBy = user ? user.profile.firstName + ' ' + user.profile.lastName : '';

                    that.logParams = {
                        timestamp: Date.now(),
                        accessBy: accessBy,
                        ipAddress: req.connection.remoteAddress,
                        event: mutation.constructor.name,
                        clientDetails: req.get('User-Agent'),
                        eventType: 'mutation',
                        payload: JSON.stringify(req.body),
                        results: {
                            authorized: that.authorizedValue,
                            status: true,
                            details: that.errorStr || ('Success executing ' + mutation.constructor.name)
                        }
                    };

                    req.appContext.AccessModel.create(that.logParams);
                }

            });
    }
}

